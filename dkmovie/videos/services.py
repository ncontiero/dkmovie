import json
import logging
import math
import os
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from django.core.files import File

from dkmovie.utils.urls import normalize_local_s3_url_to_service

from .models import Video
from .models import VideoSprite
from .models import hls_playlist_path

logger = logging.getLogger(__name__)


def get_video_metadata(video_url: str):
    if not video_url:
        return None

    video_url = normalize_local_s3_url_to_service(video_url)

    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=width,height,duration,r_frame_rate",
        "-of",
        "json",
        video_url,
    ]

    try:
        result = subprocess.run(  # noqa: S603
            command,
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            return None

        if not result.stdout:
            logger.error("FFprobe returned empty stdout")
            return None

        data = json.loads(result.stdout)
        try:
            duration = float(data.get("format", {}).get("duration", 0))
        except ValueError:
            duration = 0

        if "streams" not in data or not data["streams"]:
            logger.error("FFprobe: No streams found in data: %s", data)
            return None

        stream = data["streams"][0]

        if duration == 0:
            duration = float(stream.get("duration", 0))

        r_frame_rate = stream.get("r_frame_rate", "30/1")
        try:
            num, den = map(int, r_frame_rate.split("/"))
            fps = num / den if den > 0 else 30.0
        except (ValueError, IndexError):
            fps = 30.0

        return {
            "width": int(stream.get("width", 0)),
            "height": int(stream.get("height", 0)),
            "duration": duration,
            "fps": fps,
        }
    except (json.JSONDecodeError, Exception) as e:
        logger.exception("Error parsing FFprobe output", exc_info=e)
        return None


def get_video_duration(video_url: str) -> int:
    meta = get_video_metadata(video_url)
    return int(meta["duration"]) if meta else 0


def _get_input_url(video_instance: Video) -> tuple[str | None, str | None]:
    """Returns (input_url, error_message)"""
    if input_url := normalize_local_s3_url_to_service(video_instance.source_file.url):
        return input_url, None
    return None, "Could not generate input URL."


def _get_target_resolutions(original_height: int) -> list[dict]:
    all_resolutions = [
        {
            "name": "1080p",
            "width": 1920,
            "height": 1080,
            "bitrate": "5000k",
            "maxrate": "5350k",
            "bufsize": "7500k",
        },
        {
            "name": "720p",
            "width": 1280,
            "height": 720,
            "bitrate": "2800k",
            "maxrate": "2996k",
            "bufsize": "4200k",
        },
        {
            "name": "480p",
            "width": 854,
            "height": 480,
            "bitrate": "1400k",
            "maxrate": "1498k",
            "bufsize": "2100k",
        },
    ]
    valid = [res for res in all_resolutions if res["height"] <= original_height + 10]
    return valid or [all_resolutions[-1]]


def _build_ffmpeg_command(
    input_url: str,
    output_dir: Path,
    resolutions: list[dict],
    fps: float,
) -> list[str]:
    gop_size = str(int(fps * 2))
    split_count = len(resolutions)

    outputs = "".join([f"[v{i}]" for i in range(split_count)])
    filter_complex = f"[0:v]split={split_count}{outputs};"

    for i, res in enumerate(resolutions):
        filter_complex += f"[v{i}]scale=w={res['width']}:h={res['height']}:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2[v{i}out];"  # noqa: E501

    filter_complex = filter_complex.rstrip(";")

    cmd = ["ffmpeg", "-i", input_url, "-filter_complex", filter_complex]

    var_stream_map = []
    for i, res in enumerate(resolutions):
        cmd.extend(
            [
                "-map",
                f"[v{i}out]",
                f"-c:v:{i}",
                "libx264",
                "-crf",
                "23",
                f"-b:v:{i}",
                res["bitrate"],
                f"-maxrate:v:{i}",
                res["maxrate"],
                f"-bufsize:v:{i}",
                res["bufsize"],
                "-preset",
                "veryfast",
                "-g",
                gop_size,
                "-keyint_min",
                gop_size,
                "-sc_threshold",
                "0",
            ],
        )
        var_stream_map.append(f"v:{i},a:{i}")

    for _ in range(split_count):
        cmd.extend(["-map", "a:0"])

    cmd.extend(
        [
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-ac",
            "2",
            "-sn",
            "-threads",
            str(min(6, max(1, (os.cpu_count() or 1) - 2))),
            "-f",
            "hls",
            "-hls_time",
            "6",
            "-hls_playlist_type",
            "vod",
            "-hls_flags",
            "independent_segments",
            "-master_pl_name",
            "master.m3u8",
            "-hls_segment_filename",
            str(output_dir / "v%v/segment_%03d.ts"),
            "-var_stream_map",
            " ".join(var_stream_map),
            str(output_dir / "v%v/prog.m3u8"),
        ],
    )
    return cmd


def _upload_hls_files(video_instance: Video, output_dir: Path) -> str | None:
    hsl_storage = video_instance.hls_playlist.storage
    bucket_name = hsl_storage.bucket_name
    s3_client = hsl_storage.connection.meta.client

    relative_path = hls_playlist_path(video_instance, "master.m3u8")
    s3_base_dir = str(Path(relative_path).parent)

    files_to_upload = []
    for root, _, files in os.walk(output_dir):
        for file in files:
            local_path = Path(root) / file
            rel_path = local_path.relative_to(output_dir)
            s3_key = f"{s3_base_dir}/{rel_path}"

            content_type = "application/octet-stream"
            if file.endswith(".m3u8"):
                content_type = "application/vnd.apple.mpegurl"
            elif file.endswith(".ts"):
                content_type = "video/MP2T"

            files_to_upload.append(
                (str(local_path), bucket_name, s3_key, content_type),
            )

    def upload_single_file(args):
        local, bucket, key, c_type = args
        s3_client.upload_file(local, bucket, key, ExtraArgs={"ContentType": c_type})

    try:
        with ThreadPoolExecutor(max_workers=10) as executor:
            executor.map(upload_single_file, files_to_upload)
    except Exception as e:
        logger.exception("Error uploading HLS files", exc_info=e)
        return None
    else:
        return relative_path


def process_video_to_hls(video_instance: Video, temp_dir: str):
    if shutil.which("ffmpeg") is None:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "ffmpeg not found in system path."
        video_instance.save(update_fields=["status", "processing_error"])
        return

    input_url, error = _get_input_url(video_instance)
    if error:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = error
        video_instance.save(update_fields=["status", "processing_error"])
        return

    metadata = get_video_metadata(input_url)
    if not metadata:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "Could not probe video metadata."
        video_instance.save(update_fields=["status", "processing_error"])
        return

    output_dir = Path(temp_dir) / "hls"
    output_dir.mkdir(parents=True, exist_ok=True)

    valid_resolutions = _get_target_resolutions(metadata["height"])

    logger.info(
        "Video %s: Generating resolutions: %s",
        video_instance.id,
        [r["name"] for r in valid_resolutions],
    )

    cmd = _build_ffmpeg_command(
        input_url,
        output_dir,
        valid_resolutions,
        metadata.get("fps", 30.0),
    )

    try:
        subprocess.run(  # noqa: S603
            cmd,
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        logger.exception("FFmpeg error: %s", e.stderr, exc_info=e)
        shutil.rmtree(temp_dir, ignore_errors=True)
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = f"FFmpeg failed: {e.stderr}"
        video_instance.save(update_fields=["status", "processing_error"])
        return
    except Exception as e:
        logger.exception("Unexpected error running FFmpeg", exc_info=e)
        shutil.rmtree(temp_dir, ignore_errors=True)
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = f"Error running FFmpeg: {e}"
        video_instance.save(update_fields=["status", "processing_error"])
        return

    relative_path = _upload_hls_files(video_instance, output_dir)
    if not relative_path:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "Failed to upload files."
        video_instance.save(update_fields=["status", "processing_error"])
        shutil.rmtree(temp_dir, ignore_errors=True)
        return

    video_instance.hls_playlist.name = relative_path
    video_instance.status = Video.Status.COMPLETED
    video_instance.save(update_fields=["hls_playlist", "status"])
    shutil.rmtree(temp_dir, ignore_errors=True)


THUMB_WIDTH = 320
SPRITE_INTERVAL = 10
MAX_SPRITE_WIDTH = 1920
MAX_SPRITE_HEIGHT = 8000


def generate_video_sprites(video: Video, temp_dir: Path):
    if video.status != Video.Status.PROCESSING:
        video.status = Video.Status.PROCESSING
        video.save(update_fields=["status"])

    current_sprites = video.get_sprites()
    if current_sprites.count() > 0:
        current_sprites.delete()

    video_url = normalize_local_s3_url_to_service(video.source_file.url)
    duration = get_video_duration(video_url)
    if duration <= 0:
        logger.warning("Video duration is 0 or less. Cannot generate sprites.")
        return

    columns = math.floor(MAX_SPRITE_WIDTH / THUMB_WIDTH)
    thumb_height = int(THUMB_WIDTH * 9 / 16)
    max_rows = math.floor(MAX_SPRITE_HEIGHT / thumb_height)
    thumbs_per_sprite = columns * max_rows
    chunk_duration = thumbs_per_sprite * SPRITE_INTERVAL

    output_dir = Path(temp_dir) / "sprites"
    output_dir.mkdir(parents=True, exist_ok=True)

    total_chunks = math.ceil(duration / chunk_duration)

    for i in range(total_chunks):
        start_time = i * chunk_duration
        end_time = min((i + 1) * chunk_duration, duration)

        actual_chunk_duration = end_time - start_time
        expected_frames = math.ceil(actual_chunk_duration / SPRITE_INTERVAL)
        current_rows = math.ceil(expected_frames / columns)

        sprite_filename = f"sprite_{i}.jpg"
        output_path = output_dir / sprite_filename

        cmd = [
            "ffmpeg",
            "-y",
            "-ss",
            str(start_time),
            "-t",
            str(actual_chunk_duration),
            "-i",
            str(video_url),
            "-vf",
            f"fps=1/{SPRITE_INTERVAL},scale={THUMB_WIDTH}:-1,format=yuv420p,tile={columns}x{current_rows}",
            "-q:v",
            "5",
            str(output_path),
        ]

        try:
            subprocess.run(cmd, check=True)  # noqa: S603
        except subprocess.CalledProcessError as e:
            logger.exception("FFmpeg error: %s", e.stderr, exc_info=e)
            shutil.rmtree(temp_dir, ignore_errors=True)
            video.status = Video.Status.FAILED
            video.processing_error = f"FFmpeg failed: {e.stderr}"
            video.save(update_fields=["status", "processing_error"])
            return

        frame_height = int(THUMB_WIDTH * 9 / 16)
        with Path.open(output_path, "rb") as f:
            sprite_obj = VideoSprite.objects.create(
                video=video,
                start_time=int(start_time),
                end_time=int(end_time),
                interval=SPRITE_INTERVAL,
                frame_width=THUMB_WIDTH,
                frame_height=frame_height,
                columns=columns,
                rows=current_rows,
            )

            django_file = File(f)
            sprite_obj.image.save(sprite_filename, django_file, save=True)
        Path.unlink(output_path)

    video.status = Video.Status.COMPLETED
    video.processing_error = ""
    video.save(update_fields=["status", "processing_error"])
    shutil.rmtree(temp_dir, ignore_errors=True)

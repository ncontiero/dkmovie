import json
import logging
import math
import os
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from django.core.files import File
from django.utils.translation import gettext_lazy as _

from dkmovie.utils.urls import normalize_local_s3_url_to_service

from .models import Video
from .models import VideoSprite
from .models import VideoTrack
from .models import audio_playlist_file_path
from .models import hls_playlist_path

logger = logging.getLogger(__name__)


def get_video_metadata(video_url: str):
    if not video_url:
        return None

    video_url = normalize_local_s3_url_to_service(video_url)

    command = [
        "ffprobe",
        "-hide_banner",
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
            "crf": "22",
            "maxrate": "6400k",
            "bufsize": "12000k",
        },
        {
            "name": "720p",
            "width": 1280,
            "height": 720,
            "crf": "23",
            "maxrate": "3300k",
            "bufsize": "6000k",
        },
        {
            "name": "480p",
            "width": 854,
            "height": 480,
            "crf": "24",
            "maxrate": "1650k",
            "bufsize": "3000k",
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
        filter_complex += (
            f"[v{i}]scale=w={res['width']}:h={res['height']}:force_original_aspect_ratio=decrease,"
            f"pad=ceil(iw/2)*2:ceil(ih/2)*2:(ow-iw)/2:(oh-ih)/2[v{i}out];"
        )

    filter_complex = filter_complex.rstrip(";")

    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-y",
        "-i",
        input_url,
        "-filter_complex",
        filter_complex,
        "-preset",
        "medium",
        "-an",
        "-sn",
    ]

    var_stream_map = []
    for i, res in enumerate(resolutions):
        cmd.extend(
            [
                # Video
                "-map",
                f"[v{i}out]",
                f"-c:v:{i}",
                "libx264",
                f"-crf:{i}",
                res["crf"],
                f"-maxrate:v:{i}",
                res["maxrate"],
                f"-bufsize:v:{i}",
                res["bufsize"],
                "-g",
                gop_size,
                "-keyint_min",
                gop_size,
                "-sc_threshold",
                "0",
            ],
        )
        var_stream_map.append(f"v:{i}")

    cmd.extend(
        [
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
    video_instance.save(update_fields=["status", "hls_playlist"])
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
            "-hide_banner",
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


def get_video_tracks_metadata(video_url: str):
    video_url = normalize_local_s3_url_to_service(video_url)

    command = [
        "ffprobe",
        "-hide_banner",
        "-v",
        "error",
        "-show_entries",
        "stream=index,codec_type:stream_tags=language,title",
        "-of",
        "json",
        video_url,
    ]

    try:
        res = subprocess.run(  # noqa: S603
            command,
            capture_output=True,
            text=True,
            check=True,
        )
        data = json.loads(res.stdout)

        streams = data.get("streams", [])
        audio_streams = []
        subtitle_streams = []

        for s in streams:
            idx = s["index"]
            codec = s["codec_type"]
            tags = s.get("tags", {})
            lang = tags.get("language", "und")
            title = tags.get("title", _("Track %s") % idx)

            track_info = {
                "index": idx,
                "language": lang,
                "label": title,
            }

            if codec == "audio":
                audio_streams.append(track_info)
            elif codec == "subtitle":
                subtitle_streams.append(track_info)
    except Exception as e:
        logger.exception("Error parsing FFprobe output", exc_info=e)
        return None
    else:
        return {"audio": audio_streams, "subtitle": subtitle_streams}


def extract_audio_track(video: Video, track_instance: VideoTrack, temp_dir: Path):
    audio_index = track_instance.source_audio_index
    if not audio_index:
        logger.warning(
            "Audio track instance %s has no source_audio_index.",
            track_instance.id,
        )
        return

    input_url = normalize_local_s3_url_to_service(video.source_file.url)
    output_dir = temp_dir / "audio" / str(track_instance.id) / str(audio_index)
    output_dir.mkdir(parents=True, exist_ok=True)

    playlist_path = output_dir / "audio.m3u8"

    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-y",
        "-i",
        input_url,
        "-map",
        f"0:{audio_index}",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ac",
        "2",
        "-f",
        "hls",
        "-hls_time",
        "6",
        "-hls_playlist_type",
        "vod",
        "-hls_flags",
        "independent_segments",
        "-hls_segment_filename",
        str(output_dir / "seg_%03d.ts"),
        str(playlist_path),
    ]

    try:
        subprocess.run(cmd, check=True)  # noqa: S603
    except subprocess.CalledProcessError as e:
        logger.exception("FFmpeg audio extraction failed", exc_info=e)
        return

    # Upload logic for audio playlist
    storage = track_instance.audio_playlist.storage
    bucket_name = storage.bucket_name
    s3_client = storage.connection.meta.client

    relative_path = audio_playlist_file_path(track_instance, "audio.m3u8")
    s3_base_dir = str(Path(relative_path).parent)

    files_to_upload = []
    for root, _, files in os.walk(output_dir):
        for file in files:
            local_path = Path(root) / file
            s3_key = f"{s3_base_dir}/{file}"
            content_type = (
                "application/vnd.apple.mpegurl"
                if file.endswith(".m3u8")
                else "video/MP2T"
            )
            files_to_upload.append(
                (str(local_path), bucket_name, s3_key, content_type),
            )

    def upload_single_file(args):
        local, bucket, key, c_type = args
        s3_client.upload_file(local, bucket, key, ExtraArgs={"ContentType": c_type})

    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(upload_single_file, files_to_upload)

    track_instance.audio_playlist.name = relative_path
    track_instance.save(update_fields=["audio_playlist"])
    shutil.rmtree(temp_dir, ignore_errors=True)


def extract_subtitle_track(video: Video, track_instance: VideoTrack, temp_dir: Path):
    subtitle_index = track_instance.source_subtitle_index
    if not subtitle_index:
        logger.warning(
            "Subtitle track instance %s has no source_subtitle_index.",
            track_instance.id,
        )
        return

    input_url = normalize_local_s3_url_to_service(video.source_file.url)
    output_dir = temp_dir / "subtitles" / str(track_instance.id) / str(subtitle_index)
    output_dir.mkdir(parents=True, exist_ok=True)

    subtitle_path = output_dir / "subtitles.vtt"

    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-y",
        "-i",
        input_url,
        "-map",
        f"0:{subtitle_index}",
        "-f",
        "webvtt",
        str(subtitle_path),
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)  # noqa: S603
    except subprocess.CalledProcessError as e:
        logger.exception(
            "FFmpeg subtitle extraction failed. Stderr: %s",
            e.stderr,
            exc_info=e,
        )
        return

    # Upload logic for subtitle
    with Path.open(subtitle_path, "rb") as f:
        track_instance.subtitle_file.save(subtitle_path.name, File(f), save=True)

    shutil.rmtree(temp_dir, ignore_errors=True)

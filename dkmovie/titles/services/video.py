import json
import logging
import os
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from django.conf import settings

from dkmovie.titles.models import Video
from dkmovie.titles.models import hls_playlist_path

logger = logging.getLogger(__name__)


def get_video_metadata(video_url: str):
    if not video_url:
        return None

    # --- DOCKER NETWORK FIX ---
    if "localhost:9000" in video_url:
        video_url = video_url.replace("localhost", "minio")

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

        # Fallback duration from stream if format duration is 0
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


def process_video_to_hls(video_instance: Video, temp_dir: str):
    if shutil.which("ffmpeg") is None:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "ffmpeg not found in system path."
        video_instance.save(update_fields=["status", "processing_error"])
        return

    # Get Source URL
    input_url = video_instance.source_file.url
    if settings.DEBUG and "localhost:9000" in input_url:
        input_url = input_url.replace("localhost", "minio")

    if not input_url:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "Could not generate input URL."
        video_instance.save(update_fields=["status", "processing_error"])
        return

    metadata = get_video_metadata(input_url)
    if not metadata:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "Could not probe video metadata."
        video_instance.save(update_fields=["status", "processing_error"])
        return

    original_height = metadata.get("height", 1080)
    fps = metadata.get("fps", 30.0)
    gop_size = str(int(fps * 2))  # 2 seconds GOP

    output_dir = Path(temp_dir) / "hls"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Define target resolutions
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

    valid_resolutions = [
        res for res in all_resolutions if res["height"] <= original_height + 10
    ] or [all_resolutions[-1]]

    # Build Filter Complex
    split_count = len(valid_resolutions)
    outputs = "".join([f"[v{i}]" for i in range(split_count)])
    filter_complex = f"[0:v]split={split_count}{outputs};"

    for i, res in enumerate(valid_resolutions):
        filter_complex += f"[v{i}]scale=w={res['width']}:h={res['height']}:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2[v{i}out];"  # noqa: E501

    filter_complex = filter_complex.rstrip(";")

    # Build Command
    cmd = ["ffmpeg", "-i", input_url, "-filter_complex", filter_complex]

    # Video Maps & Settings
    var_stream_map = []
    for i, res in enumerate(valid_resolutions):
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

    # Audio Maps (One per video stream, re-encoding AAC)
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
        ],
    )

    # HLS Output Settings
    cmd.extend(
        [
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

    hsl_storage = video_instance.hls_playlist.storage
    bucket_name = hsl_storage.bucket_name
    s3_client = hsl_storage.connection.meta.client

    # Calculate base S3 path
    relative_path = hls_playlist_path(video_instance, "master.m3u8")
    s3_base_dir = str(Path(relative_path).parent)

    files_to_upload = []
    for root, _, files in os.walk(output_dir):
        for file in files:
            local_path = Path(root) / file
            rel_path = local_path.relative_to(output_dir)
            s3_key = f"{s3_base_dir}/{rel_path}"

            # 4. Determine Content-Type (Critical for iOS/Safari)
            content_type = "application/octet-stream"
            if file.endswith(".m3u8"):
                content_type = "application/vnd.apple.mpegurl"  # Standard HLS MIME
            elif file.endswith(".ts"):
                content_type = "video/MP2T"

            files_to_upload.append(
                (str(local_path), bucket_name, s3_key, content_type),
            )

    def upload_single_file(args):
        local, bucket, key, c_type = args
        s3_client.upload_file(
            local,
            bucket,
            key,
            ExtraArgs={"ContentType": c_type},
        )

    try:
        # Upload up to 10 files at once
        with ThreadPoolExecutor(max_workers=10) as executor:
            executor.map(upload_single_file, files_to_upload)
    except Exception as e:
        logger.exception("Error uploading HLS files", exc_info=e)
        shutil.rmtree(temp_dir, ignore_errors=True)
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = f"Failed to upload HLS files: {e}"
        video_instance.save(update_fields=["status", "processing_error"])
        return

    video_instance.hls_playlist.name = relative_path
    video_instance.status = Video.Status.COMPLETED
    video_instance.save(update_fields=["hls_playlist", "status"])
    shutil.rmtree(temp_dir, ignore_errors=True)

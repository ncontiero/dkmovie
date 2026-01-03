import json
import logging
import os
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from os import cpu_count
from pathlib import Path

from django.conf import settings

from dkmovie.titles.models import Video
from dkmovie.titles.models import hls_playlist_path

logger = logging.getLogger(__name__)


def get_video_duration(video_url: str) -> int:
    if not video_url:
        return 0

    # --- DOCKER NETWORK FIX ---
    # When running inside Docker, 'localhost' refers to the container itself.
    # If the URL points to localhost:9000 (MinIO), we must change it to the
    # container hostname ('minio').
    if "localhost:9000" in video_url:
        video_url = video_url.replace("localhost", "minio")
        logger.info("Patched URL for Docker: %s", video_url)

    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
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
            logger.error("FFprobe error: %s", result.stderr)
            return 0

        data = json.loads(result.stdout)
        duration_float = float(data["format"]["duration"])
        return int(duration_float)

    except (KeyError, ValueError, json.JSONDecodeError) as e:
        logger.exception("Error parsing FFprobe output", exc_info=e)
        return 0
    except subprocess.TimeoutExpired as e:
        logger.exception("FFprobe timed out connecting to URL", exc_info=e)
        return 0
    except FileNotFoundError as e:
        logger.exception("FFmpeg/FFprobe not installed on the system.", exc_info=e)
        return 0


def process_video_to_hls(video_instance: Video, temp_dir: str):
    """
    Converts the video source file to HLS using ffmpeg.
    Uploads the resulting files to S3 in parallel.
    Updates the video instance status and hls_playlist field.
    """

    if shutil.which("ffmpeg") is None:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "ffmpeg not found in system path."
        video_instance.save(update_fields=["status", "processing_error"])
        return

    # Get Source URL
    input_url = video_instance.source_file.url
    # --- DOCKER NETWORK FIX ---
    if settings.DEBUG and "localhost:9000" in input_url:
        input_url = input_url.replace("localhost", "minio")

    if not input_url:
        video_instance.status = Video.Status.FAILED
        video_instance.processing_error = "Could not generate input URL."
        video_instance.save(update_fields=["status", "processing_error"])
        return

    output_dir = Path(temp_dir) / "hls"
    output_dir.mkdir(parents=True, exist_ok=True)

    playlist_path = output_dir / "master.m3u8"
    segment_filename = output_dir / "segment_%03d.ts"

    cmd_options = (
        [
            "-t",
            "300",
            "-crf",
            "28",
            "-preset",
            "ultrafast",
            "-vf",
            "scale=-2:480",
        ]
        if settings.DEBUG
        else ["-crf", "23", "-preset", "veryfast"]
    )
    cmd = [
        "ffmpeg",
        "-i",
        input_url,
        "-threads",
        str(max(1, cpu_count() - 2)),
        "-c:v",
        "libx264",
        *cmd_options,
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-sc_threshold",
        "0",
        "-f",
        "hls",
        "-hls_time",
        "10",
        "-hls_playlist_type",
        "vod",
        "-hls_segment_filename",
        str(segment_filename),
        str(playlist_path),
    ]

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
            s3_key = f"{s3_base_dir}/{file}"

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
    video_instance.save(update_fields=["status", "hls_playlist"])
    shutil.rmtree(temp_dir, ignore_errors=True)

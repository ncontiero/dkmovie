import json
import logging
import subprocess

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

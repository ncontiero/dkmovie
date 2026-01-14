import json
import logging
import subprocess

from dkmovie.utils.urls import normalize_local_s3_url_to_service

logger = logging.getLogger(__name__)


def get_video_metadata(video_url: str):
    if not video_url:
        return None

    command = [
        "ffprobe",
        "-hide_banner",
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=width,height,duration,r_frame_rate",
        "-of",
        "json",
        normalize_local_s3_url_to_service(video_url),
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

import logging
import math
import shutil
import subprocess
from pathlib import Path

from django.core.files import File

from dkmovie.utils.urls import normalize_local_s3_url_to_service
from dkmovie.videos.models import Video
from dkmovie.videos.models import VideoSprite
from dkmovie.videos.utils import get_threads_count

from .video_metadata import get_video_duration

logger = logging.getLogger(__name__)

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
            "-threads",
            str(get_threads_count()),
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
            video.processing_error = f"FFmpeg failed to generate sprites: {e.stderr}"
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

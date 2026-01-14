import logging
import shutil
import tempfile
from pathlib import Path

from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded

from dkmovie.utils.tasks import default_task_params

from .models import Video
from .models import VideoTrack
from .services.video_metadata import get_video_duration
from .services.video_processor import process_video_to_hls
from .services.video_sprites_generator import generate_video_sprites
from .services.video_tracks_processor import extract_audio_track
from .services.video_tracks_processor import extract_subtitle_track
from .services.video_tracks_processor import get_video_tracks_metadata

logger = logging.getLogger(__name__)


@shared_task(**default_task_params("calculate_video_duration"))
def calculate_video_duration(self, video_id):
    try:
        video = Video.objects.get(id=video_id)
        if not video.source_file:
            return

        duration = get_video_duration(video.source_file.url)
        if duration > 0:
            video.duration = duration
            video.save(update_fields=["duration"])
    except Video.DoesNotExist as e:
        logger.exception("Video with ID %s does not exist", video_id, exc_info=e)


@shared_task(
    **default_task_params("process_video_hls_task"),
    soft_time_limit=14400,
    time_limit=14500,
)
def process_video_hls_task(self, video_id):
    try:
        video = Video.objects.get(id=video_id)
    except Video.DoesNotExist as e:
        logger.exception("Video with ID %s does not exist", video_id, exc_info=e)
        return

    temp_dir = tempfile.mkdtemp()
    try:
        process_video_to_hls(video, temp_dir)
        discover_tracks_task.delay(video_id)
    except SoftTimeLimitExceeded as e:
        logger.exception("SoftTimeLimitExceeded for video %s", video_id, exc_info=e)
        shutil.rmtree(temp_dir, ignore_errors=True)
        video.status = Video.Status.FAILED
        video.processing_error = f"SoftTimeLimitExceeded: {e}"
        video.save(update_fields=["status", "processing_error"])
    except Exception as e:
        logger.exception("Unexpected error processing video %s", video_id, exc_info=e)
        shutil.rmtree(temp_dir, ignore_errors=True)
        video.status = Video.Status.FAILED
        video.processing_error = str(e)
        video.save(update_fields=["status", "processing_error"])


@shared_task(
    **default_task_params(
        "generate_video_sprites_task",
        soft_time_limit=1800,
        time_limit=1920,
    ),
)
def generate_video_sprites_task(self, video_id):
    try:
        video = Video.objects.get(id=video_id)
    except Video.DoesNotExist as e:
        logger.exception("Video with ID %s does not exist", video_id, exc_info=e)
        return

    temp_dir = tempfile.mkdtemp()
    try:
        generate_video_sprites(video, temp_dir)
    except SoftTimeLimitExceeded as e:
        logger.exception("SoftTimeLimitExceeded for video %s", video_id, exc_info=e)
        shutil.rmtree(temp_dir, ignore_errors=True)
        video.status = Video.Status.FAILED
        video.processing_error = f"SoftTimeLimitExceeded: {e}"
        video.save(update_fields=["status", "processing_error"])
    except Exception as e:
        logger.exception("Unexpected error processing video %s", video_id, exc_info=e)
        shutil.rmtree(temp_dir, ignore_errors=True)
        video.status = Video.Status.FAILED
        video.processing_error = str(e)
        video.save(update_fields=["status", "processing_error"])


@shared_task(**default_task_params("discover_tracks_task"))
def discover_tracks_task(self, video_id):
    try:
        video = Video.objects.get(id=video_id)
    except Video.DoesNotExist as e:
        logger.exception("Video with ID %s does not exist", video_id, exc_info=e)
        return

    metadata = get_video_tracks_metadata(video.source_file.url)
    if not metadata:
        return

    # Create Audio Tracks
    for stream in metadata["audio"]:
        track, created = VideoTrack.objects.update_or_create(
            video=video,
            language=stream["language"],
            defaults={
                "source_audio_index": stream["index"],
                "label": stream["label"],
            },
        )
        if created or not track.audio_playlist:
            process_track_task.delay(track.id)

    # Create Subtitle Tracks
    for stream in metadata["subtitle"]:
        track, created = VideoTrack.objects.update_or_create(
            video=video,
            language=stream["language"],
            defaults={
                "source_subtitle_index": stream["index"],
                "label": stream["label"],
            },
        )
        if created or not track.subtitle_file:
            process_track_task.delay(track.id)


@shared_task(
    **default_task_params("process_track_task", soft_time_limit=3600, time_limit=3700),
)
def process_track_task(self, track_id):
    try:
        track = VideoTrack.objects.select_related("video").get(id=track_id)
    except VideoTrack.DoesNotExist:
        return

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        if track.source_audio_index is not None:
            extract_audio_track(track.video, track, temp_path)

        if track.source_subtitle_index is not None:
            extract_subtitle_track(track.video, track, temp_path)

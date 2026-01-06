import logging
import shutil
import tempfile

from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded

from dkmovie.utils.tasks import default_task_params

from .models import Video
from .services import get_video_duration
from .services import process_video_to_hls

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

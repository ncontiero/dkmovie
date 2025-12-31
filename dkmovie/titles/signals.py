from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Video
from .tasks import calculate_video_duration
from .tasks import process_video_hls_task


@receiver(post_save, sender=Video)
def video_post_save(sender, instance, created, **kwargs):
    if instance.source_file:
        if created or instance.duration == 0:
            transaction.on_commit(lambda: calculate_video_duration.delay(instance.id))
        if instance.status == Video.Status.PENDING:
            Video.objects.filter(id=instance.id).update(status=Video.Status.PROCESSING)
            transaction.on_commit(lambda: process_video_hls_task.delay(instance.id))

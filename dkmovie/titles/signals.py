from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Video
from .tasks import calculate_video_duration


@receiver(post_save, sender=Video)
def video_post_save(sender, instance, created, **kwargs):
    if instance.source_file and (created or instance.duration == 0):
        transaction.on_commit(lambda: calculate_video_duration.delay(instance.id))

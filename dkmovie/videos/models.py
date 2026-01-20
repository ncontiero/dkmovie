import contextlib
import logging
from uuid import uuid4

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils.translation import gettext_lazy as _
from slugify import slugify

from config.storages import PrivateMediaStorage
from dkmovie.upload.fields import S3FileField

logger = logging.getLogger(__name__)


def get_title_video_path(title_obj, filename, folder=None):
    path = f"{folder}/{filename}" if folder else filename
    if title_obj and title_obj.id:
        title_path = f"titles/{title_obj.id}"
        return f"{title_path}/{path}"
    return f"uploads/movies/{uuid4()}/{path}"


def get_episode_video_path(episode_obj, filename, folder=None):
    path = f"{folder}/{filename}" if folder else filename
    with contextlib.suppress(Exception):
        title_id = episode_obj.season.title.id
        season_number = episode_obj.season.number
        episode_number = episode_obj.number
        episode_path = f"titles/{title_id}/seasons/{season_number}/{episode_number}"
        return f"{episode_path}/{path}"
    return f"uploads/episodes/{uuid4()}/{path}"


def get_source_file_path(instance, filename, folder=None):
    if parent := instance.content_object:
        model_name = instance.content_type.model.lower()
        if model_name == "title":
            return get_title_video_path(parent, filename, folder)
        if model_name == "episode":
            return get_episode_video_path(parent, filename, folder)

    path = f"{folder}/{filename}" if folder else filename
    if instance and instance.id:
        return f"uploads/videos/{instance.id}/{path}"
    return f"uploads/videos/{uuid4()}/{path}"


def source_file_path(instance, filename):
    return get_source_file_path(instance, filename)


def hls_playlist_path(instance, filename):
    return get_source_file_path(instance, filename, folder="hls")


def get_sprite_file_path(instance, filename):
    return get_source_file_path(instance.video, filename, folder="sprites")


def subtitle_file_path(instance, filename):
    lang = slugify(instance.language)
    subtitle_index = instance.source_subtitle_index or 0
    return get_source_file_path(
        instance.video,
        filename,
        folder=f"subtitles/{lang}/{subtitle_index}",
    )


def audio_playlist_file_path(instance, filename):
    lang = slugify(instance.language)
    audio_index = instance.source_audio_index or 0
    return get_source_file_path(
        instance.video,
        filename,
        folder=f"audio/{lang}/{audio_index}",
    )


class Video(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        PROCESSING = "PROCESSING", _("Processing")
        COMPLETED = "COMPLETED", _("Completed")
        FAILED = "FAILED", _("Failed")

    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the video"),
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        help_text=_("The type of the object this video belongs to (Title or Episode)"),
    )
    object_id = models.UUIDField(
        help_text=_("The ID of the object this video belongs to"),
    )
    content_object = GenericForeignKey("content_type", "object_id")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text=_("The status of the video processing"),
    )
    source_file = S3FileField(
        upload_to=source_file_path,
        storage=PrivateMediaStorage(),
        blank=True,
        null=True,
        max_length=500,
        help_text=_("The video file"),
    )
    hls_playlist = S3FileField(
        upload_to=hls_playlist_path,
        storage=PrivateMediaStorage(),
        blank=True,
        null=True,
        max_length=500,
        help_text=_("The HLS master playlist file"),
    )
    processing_error = models.TextField(
        blank=True,
        help_text=_("Error message if processing failed"),
    )
    duration = models.PositiveIntegerField(
        default=0,
        help_text=_("The duration in seconds"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Date and time when the video was created"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_("Date and time when the video was last updated"),
    )

    class Meta:
        verbose_name = _("Video")
        verbose_name_plural = _("Videos")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id"],
                name="unique_video_per_object",
            ),
        ]

    def __str__(self):
        content = (hasattr(self, "content_object") and self.content_object) or self.id
        return _("Video for %s") % (content)

    @property
    def is_available(self) -> bool:
        return self.status == self.Status.COMPLETED and bool(self.hls_playlist)

    def get_sprites(self):
        return self.sprites.all()

    def get_tracks(self):
        return self.tracks.all()

    def get_markers(self):
        return self.markers.all()


class VideoSprite(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the sprite sheet"),
    )
    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name="sprites",
        help_text=_("The video this sprite belongs to"),
    )
    image = models.ImageField(
        upload_to=get_sprite_file_path,
        help_text=_("The sprite sheet image file (JPEG)"),
    )
    start_time = models.PositiveIntegerField(
        help_text=_("Time in seconds where this sprite sheet starts (e.g., 0)"),
    )
    end_time = models.PositiveIntegerField(
        help_text=_("Time in seconds where this sprite sheet ends"),
    )
    interval = models.PositiveIntegerField(
        default=10,
        help_text=_("Interval in seconds between each thumbnail"),
    )
    frame_width = models.PositiveIntegerField(
        help_text=_("Width of a single thumbnail in pixels"),
    )
    frame_height = models.PositiveIntegerField(
        help_text=_("Height of a single thumbnail in pixels"),
    )
    columns = models.PositiveIntegerField(
        help_text=_("Number of columns in the sprite sheet grid"),
    )
    rows = models.PositiveIntegerField(
        help_text=_("Number of rows in the sprite sheet grid"),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Video Sprite")
        verbose_name_plural = _("Video Sprites")
        ordering = ["video", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["video", "start_time"],
                name="unique_sprite_start_time_per_video",
            ),
        ]

    def __str__(self):
        return _("Sprite for %s (%ss - %ss)") % (
            self.video,
            self.start_time,
            self.end_time,
        )


class VideoTrack(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the media track"),
    )
    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name="tracks",
        help_text=_("The video this track belongs to"),
    )
    language = models.CharField(
        max_length=10,
        default="pt-br",
        help_text=_("Language code (e.g., 'en', 'pt-br')"),
    )
    label = models.CharField(
        max_length=50,
        default="Português",
        help_text=_("Label shown to the user (e.g., 'English', 'Português')"),
    )
    is_original = models.BooleanField(
        default=False,
        help_text=_("If true, this track is the original language track."),
    )
    subtitle_file = S3FileField(
        upload_to=subtitle_file_path,
        storage=PrivateMediaStorage(),
        blank=True,
        null=True,
        max_length=500,
        help_text=_("The WebVTT subtitle file (.vtt)"),
    )
    audio_playlist = S3FileField(
        upload_to=audio_playlist_file_path,
        storage=PrivateMediaStorage(),
        blank=True,
        null=True,
        max_length=500,
        help_text=_("The HLS manifest for the audio track (.m3u8)"),
    )

    source_audio_index = models.IntegerField(
        null=True,
        blank=True,
        help_text=_("Original FFmpeg stream index for the audio (if extracted)"),
    )
    source_subtitle_index = models.IntegerField(
        null=True,
        blank=True,
        help_text=_("Original FFmpeg stream index for the subtitle (if extracted)"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Media Track")
        verbose_name_plural = _("Media Tracks")
        ordering = ["language", "label"]
        constraints = [
            models.UniqueConstraint(
                fields=["video", "language"],
                name="unique_language_per_video",
            ),
        ]

    def __str__(self):
        components = []
        if self.audio_playlist:
            components.append("Audio")
        if self.subtitle_file:
            components.append("Sub")
        return f"{self.label} [{'/'.join(components)}]"

    @property
    def has_audio(self) -> bool:
        return bool(self.audio_playlist)


class VideoMarker(models.Model):
    MARKER_TYPES = (
        ("recap", _("Recap")),
        ("intro", _("Intro")),
        ("credits", _("Credits (Next Ep)")),
    )

    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name="markers",
        help_text=_("The video this marker belongs to"),
    )
    label = models.CharField(
        max_length=20,
        choices=MARKER_TYPES,
        help_text=_("Type of marker"),
    )

    start_time = models.PositiveIntegerField(
        help_text=_("Time in seconds when the event starts"),
    )
    end_time = models.PositiveIntegerField(
        help_text=_("Time in seconds when the event ends"),
    )

    class Meta:
        verbose_name = _("Video Marker")
        verbose_name_plural = _("Video Markers")
        ordering = ["video", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["video", "label", "start_time"],
                name="unique_marker_per_video_start_time",
                violation_error_message=_(
                    "Marker with this label and start time already exists for this video",  # noqa: E501
                ),
            ),
            models.CheckConstraint(
                condition=models.Q(end_time__gt=models.F("start_time")),
                name="end_time_greater_than_start_time",
                violation_error_message=_("End time must be greater than start time"),
            ),
        ]

    def __str__(self):
        return f"{self.video} - {self.label} ({self.start_time}-{self.end_time}s)"

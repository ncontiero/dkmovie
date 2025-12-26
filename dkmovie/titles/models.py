import contextlib
from uuid import uuid4

from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from slugify import slugify

from dkmovie.upload.fields import S3FileField

BASE_TMDB_URL = "https://www.themoviedb.org"


def poster_path(instance, filename):
    return f"titles/{instance.id}/posters/{filename}"


def cover_path(instance, filename):
    return f"titles/{instance.id}/covers/{filename}"


def video_path(instance, filename):
    if instance and instance.id:
        return f"titles/{instance.id}/videos/{filename}"
    return f"uploads/movies/{uuid4()}/{filename}"


def season_path(instance, filename):
    return f"titles/{instance.title.id}/seasons/{instance.number}/{filename}"


def episode_path(instance, filename):
    title_id = instance.season.title.id
    return f"titles/{title_id}/seasons/{instance.season.number}/episodes/{filename}"


def episode_video_path(instance, filename):
    with contextlib.suppress(Exception):
        title_id = instance.season.title.id
        season_number = instance.season.number
        return f"titles/{title_id}/seasons/{season_number}/episodes/videos/{filename}"
    return f"uploads/episodes/{uuid4()}/{filename}"


class Genre(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the genre"),
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text=_("A unique identifier for the genre"),
    )
    name = models.CharField(
        max_length=100,
        help_text=_("Name of the genre (e.g., Action, Comedy)"),
    )

    class Meta:
        verbose_name = _("Genre")
        verbose_name_plural = _("Genres")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Title(models.Model):
    """
    Model to store a specific title, which can be a Movie or a Series.
    """

    class ContentType(models.TextChoices):
        MOVIE = "MOVIE", _("Movie")
        SERIES = "SERIES", _("Series")

    class Status(models.TextChoices):
        COMING_SOON = "COMING_SOON", _("Coming Soon")
        RELEASED = "RELEASED", _("Released")
        CANCELED = "CANCELED", _("Canceled")
        AWAITING_REVIEW = "AWAITING_REVIEW", _("Awaiting Review")

    class AddedBy(models.TextChoices):
        TMDB = "TMDB", _("The Movie Database")
        MANUAL = "MANUAL", _("Manual")

    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the title"),
    )
    tmdb_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_("The TMDB ID of the title"),
    )
    title = models.CharField(
        max_length=255,
        help_text=_("The official title of the movie or series"),
    )
    description = models.TextField(
        blank=True,
        help_text=_("A brief summary or synopsis"),
    )
    content_type = models.CharField(
        max_length=10,
        choices=ContentType.choices,
        default=ContentType.MOVIE,
        help_text=_("The type of content (Movie or Series)"),
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AWAITING_REVIEW,
        help_text=_("The current status of the title"),
    )
    release_date = models.DateField(
        blank=True,
        null=True,
        help_text=_("The original release date"),
    )
    duration = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text=_("The duration in minutes"),
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0,
        help_text=_("The average rating out of 10"),
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    genres = models.ManyToManyField(
        Genre,
        related_name="titles",
        blank=True,
        help_text=_("Select one or more genres for this title"),
    )
    cast = models.TextField(
        blank=True,
        help_text=_("List of main cast members"),
    )
    poster = models.ImageField(
        upload_to=poster_path,
        blank=True,
        null=True,
        help_text=_("Vertical poster image (portrait)"),
    )
    cover = models.ImageField(
        upload_to=cover_path,
        blank=True,
        null=True,
        help_text=_("Horizontal cover image (backdrop)"),
    )
    trailer_url = models.URLField(
        max_length=255,
        blank=True,
        help_text=_("Link to the official YouTube trailer"),
    )
    video_file = S3FileField(
        upload_to=video_path,
        blank=True,
        null=True,
        max_length=500,
        help_text=_("The video file for the movie"),
    )
    added_by = models.CharField(
        max_length=10,
        choices=AddedBy.choices,
        default=AddedBy.MANUAL,
        help_text=_("Indicates how the title was added to the database"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Date and time when the title was created"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_("Date and time when the title was last updated"),
    )

    class Meta:
        verbose_name = _("Title")
        verbose_name_plural = _("Titles")
        # Order by most recent release date first
        ordering = ["-release_date"]

    def __str__(self):
        return f"{self.title} ({self.get_content_type_display()})"

    @property
    def seasons_count(self):
        return self.seasons.count()

    @property
    def is_video_available(self) -> bool:
        if self.content_type == self.ContentType.MOVIE:
            return bool(self.video_file)
        if self.content_type == self.ContentType.SERIES:
            return self.seasons.filter(episodes__video_file__isnull=False).exists()
        return False

    def get_first_episode(self):
        if self.content_type != self.ContentType.SERIES:
            return None
        return (
            Episode.objects.filter(season__title=self)
            .order_by("season__number", "number")
            .first()
        )

    @property
    def tmdb_url(self) -> None | str:
        if not self.tmdb_id:
            return None
        media_type = "movie" if self.content_type == Title.ContentType.MOVIE else "tv"
        return f"{BASE_TMDB_URL}/{media_type}/{self.tmdb_id}"


class Season(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the season"),
    )
    tmdb_id = models.PositiveIntegerField(
        unique=True,
        null=True,
        blank=True,
        help_text=_("The TMDB ID of the season"),
    )
    title = models.ForeignKey(
        Title,
        on_delete=models.CASCADE,
        related_name="seasons",
        help_text=_("The title to which this season belongs"),
    )
    number = models.PositiveIntegerField(default=1, help_text=_("Season number"))
    name = models.CharField(max_length=255, help_text=_("Season name"))
    overview = models.TextField(blank=True, help_text=_("Season overview"))
    poster = models.ImageField(
        upload_to=season_path,
        blank=True,
        null=True,
        help_text=_("Season poster image"),
    )
    air_date = models.DateField(
        blank=True,
        null=True,
        help_text=_("The date when the season premiered"),
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0,
        help_text=_("The average rating out of 10"),
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Date and time when the season was created"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_("Date and time when the season was last updated"),
    )

    class Meta:
        verbose_name = _("Season")
        verbose_name_plural = _("Seasons")
        constraints = [
            models.UniqueConstraint(
                fields=["title", "number"],
                name="unique_season_per_title",
            ),
        ]
        ordering = ["number"]

    def __str__(self):
        return _("%s (Season %d)") % (self.title.title, self.number)

    @property
    def episode_count(self) -> int:
        return self.episodes.count()

    @property
    def tmdb_url(self) -> None | str:
        if not self.tmdb_id:
            return None
        return f"{BASE_TMDB_URL}/tv/{self.title.tmdb_id}/season/{self.number}"


class Episode(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the episode"),
    )
    tmdb_id = models.PositiveIntegerField(
        unique=True,
        null=True,
        blank=True,
        help_text=_("The TMDB ID of the episode"),
    )
    season = models.ForeignKey(
        Season,
        on_delete=models.CASCADE,
        related_name="episodes",
        help_text=_("The season to which this episode belongs"),
    )
    number = models.PositiveIntegerField(default=1, help_text=_("Episode number"))
    name = models.CharField(max_length=255, help_text=_("Episode name"))
    overview = models.TextField(blank=True, help_text=_("Episode overview"))
    still = models.ImageField(
        upload_to=episode_path,
        blank=True,
        null=True,
        help_text=_("Episode still image"),
    )
    air_date = models.DateField(
        blank=True,
        null=True,
        help_text=_("The date when the episode premiered"),
    )
    duration = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text=_("The duration in minutes"),
    )
    video_file = S3FileField(
        upload_to=episode_video_path,
        blank=True,
        null=True,
        max_length=500,
        help_text=_("The video file for the episode"),
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0,
        help_text=_("The average rating out of 10"),
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_("Date and time when the episode was created"),
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text=_("Date and time when the episode was last updated"),
    )

    class Meta:
        verbose_name = _("Episode")
        verbose_name_plural = _("Episodes")
        constraints = [
            models.UniqueConstraint(
                fields=["season", "number"],
                name="unique_episode_per_season",
            ),
        ]
        ordering = ["season__number", "number"]

    def __str__(self):
        return (
            f"{self.season.title.title} S{self.season.number:02d}E{self.number:02d}"
            f" - {self.name}"
        )

    @property
    def is_video_available(self) -> bool:
        return bool(self.video_file)

    def get_next_episode(self):
        return (
            Episode.objects.filter(
                season__title=self.season.title,
                season__number__gte=self.season.number,
                number__gt=self.number,
            )
            .order_by("season__number", "number")
            .first()
        )

    @property
    def tmdb_url(self) -> None | str:
        if not self.tmdb_id:
            return None
        season_path = f"tv/{self.season.title.tmdb_id}/season/{self.season.number}"
        return f"{BASE_TMDB_URL}/{season_path}/episode/{self.number}"

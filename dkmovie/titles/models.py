from uuid import uuid4

from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from slugify import slugify


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

    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
        help_text=_("Unique identifier for the title"),
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
        upload_to="posters/",
        blank=True,
        null=True,
        help_text=_("Vertical poster image (portrait)"),
    )
    cover = models.ImageField(
        upload_to="covers/",
        blank=True,
        null=True,
        help_text=_("Horizontal cover image (backdrop)"),
    )
    trailer_url = models.URLField(
        max_length=255,
        blank=True,
        help_text=_("Link to the official YouTube trailer"),
    )

    class Meta:
        verbose_name = _("Title")
        verbose_name_plural = _("Titles")
        # Order by most recent release date first, then by title
        ordering = ["-release_date", "title"]

    def __str__(self):
        return f"{self.title} ({self.get_content_type_display()})"

from typing import ClassVar

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title

from .managers import UserManager


class SavedTitle(models.Model):
    user = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="saved_titles_entries",
    )
    title = models.ForeignKey(
        Title,
        on_delete=models.CASCADE,
        related_name="saved_by_users",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Saved Title")
        verbose_name_plural = _("Saved Titles")
        ordering = ["-added_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "title"],
                name="unique_user_title_list",
                violation_error_message=_("You have already saved this title."),
            ),
        ]

    def __str__(self):
        return _("%s saved %s") % (self.user, self.title)


class HistoryEntry(models.Model):
    class Status(models.TextChoices):
        WATCHING = "WATCHING", _("Watching")
        WATCHED = "WATCHED", _("Watched")

    user = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="history_entries",
    )
    title = models.ForeignKey(
        Title,
        on_delete=models.CASCADE,
        related_name="watched_by_users",
    )
    episode = models.ForeignKey(
        Episode,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="watched_by_users",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.WATCHING,
        help_text=_("The current status of the history entry"),
    )
    watched_seconds = models.PositiveIntegerField(default=0)
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("History Entry")
        verbose_name_plural = _("History Entries")
        ordering = ["-watched_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "title", "episode"],
                name="unique_user_title_episode_history",
                violation_error_message=_("This title is already in your history."),
            ),
        ]

    def __str__(self):
        return _("%s watched %s for %s seconds") % (
            self.user,
            self.episode or self.title,
            self.watched_seconds,
        )


class User(AbstractUser):
    # First and last name do not cover name patterns around the globe
    name = models.CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None
    last_name = None
    email = models.EmailField(_("email address"), unique=True)
    username = None

    my_list = models.ManyToManyField(
        Title,
        through=SavedTitle,
        related_name="users_who_listed",
        blank=True,
        verbose_name=_("My List"),
        help_text=_("Titles saved by the user to their personal list."),
    )
    history = models.ManyToManyField(
        Title,
        through=HistoryEntry,
        related_name="users_who_watched",
        blank=True,
        verbose_name=_("History"),
        help_text=_("Titles watched by the user."),
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects: ClassVar[UserManager] = UserManager()

    def get_history_entries(self) -> list[HistoryEntry]:
        return self.history_entries.select_related(
            "title",
            "episode",
            "episode__season",
        ).all()

    def update_history(
        self,
        title: Title,
        seconds: int,
        episode: Episode | None = None,
        *,
        watched: bool = False,
    ) -> None:
        """
        Updates the watch history. If the entry exists, it updates the timestamp
        and the seconds watched. If not, it creates it.
        """
        status = (
            HistoryEntry.Status.WATCHED if watched else HistoryEntry.Status.WATCHING
        )
        HistoryEntry.objects.update_or_create(
            user=self,
            title=title,
            episode=episode,
            defaults={"watched_seconds": seconds, "status": status},
        )

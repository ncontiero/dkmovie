from __future__ import annotations

from typing import TYPE_CHECKING

from ninja import ModelSchema
from ninja import Schema

from dkmovie.titles.models import Episode

from .models import HistoryEntry
from .models import User

if TYPE_CHECKING:
    from uuid import UUID


class HistoryEntryEpisodeSchema(ModelSchema):
    season_number: int
    episode_number: int

    class Meta:
        model = Episode
        fields = ["id"]

    @staticmethod
    def resolve_season_number(episode: Episode) -> int:
        return episode.season.number or 0

    @staticmethod
    def resolve_episode_number(episode: Episode) -> int:
        return episode.number or 0


class HistoryEntrySchema(ModelSchema):
    episode: HistoryEntryEpisodeSchema | None = None

    class Meta:
        model = HistoryEntry
        fields = ["title", "episode", "status", "watched_seconds", "watched_at"]


class UserSchemaOut(ModelSchema):
    history: list[HistoryEntrySchema] = []

    class Meta:
        model = User
        fields = ["id", "name", "email", "is_superuser", "my_list"]

    @staticmethod
    def resolve_history(user: User) -> list[HistoryEntrySchema]:
        return user.get_history_entries()


class UserSchemaIn(Schema):
    name: str


class LanguageSchema(Schema):
    language: str


class AddToHistorySchema(Schema):
    title_id: UUID
    watched_seconds: int
    episode_id: UUID | None = None
    watched: bool = False

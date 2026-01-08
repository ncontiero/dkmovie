from typing import Annotated
from uuid import UUID

from django.db.models import Q
from ninja import FilterLookup
from ninja import FilterSchema
from ninja import ModelSchema

from dkmovie.videos.schemas import VideoSpriteSchema

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title


class GenreSchema(ModelSchema):
    class Meta:
        model = Genre
        fields = ["slug", "name"]


class BaseTitleSchema(ModelSchema):
    genres: list[GenreSchema] = []
    is_video_available: bool = False
    duration: int = 0
    first_episode_id: UUID | None = None

    class Meta:
        model = Title
        fields = [
            "id",
            "title",
            "description",
            "content_type",
            "release_date",
            "rating",
            "cast",
            "poster",
            "cover",
            "trailer_url",
        ]

    @staticmethod
    def resolve_is_video_available(title: Title) -> bool:
        return title.is_video_available

    @staticmethod
    def resolve_duration(title: Title) -> int:
        return title.duration

    @staticmethod
    def resolve_first_episode_id(title: Title) -> UUID | None:
        first_episode = title.get_first_episode()
        return first_episode.id if first_episode else None


class SeasonSchema(ModelSchema):
    episode_count: int = 0

    class Meta:
        model = Season
        fields = [
            "id",
            "number",
            "name",
            "overview",
            "poster",
            "air_date",
            "rating",
        ]

    @staticmethod
    def resolve_episodes_count(season: Season) -> int:
        return season.episode_count


class TitleDetailSchema(BaseTitleSchema):
    seasons: list[SeasonSchema] = []
    sprites: list[VideoSpriteSchema] = []

    class Meta(BaseTitleSchema.Meta):
        fields = BaseTitleSchema.Meta.fields

    @staticmethod
    def resolve_sprites(title: Title) -> list[VideoSpriteSchema]:
        return title.video.get_sprites() if title.video else []


class BaseEpisodeSchema(ModelSchema):
    duration: int = 0
    is_video_available: bool = False

    class Meta:
        model = Episode
        fields = [
            "id",
            "number",
            "name",
            "overview",
            "still",
            "air_date",
            "rating",
        ]

    @staticmethod
    def resolve_duration(episode: Episode) -> int:
        return episode.duration

    @staticmethod
    def resolve_is_video_available(episode: Episode) -> bool:
        return episode.is_video_available


class EpisodeSchema(BaseEpisodeSchema):
    season: SeasonSchema = None
    next_episode: BaseEpisodeSchema | None = None
    sprites: list[VideoSpriteSchema] = []

    class Meta(BaseEpisodeSchema.Meta):
        fields = BaseEpisodeSchema.Meta.fields

    @staticmethod
    def resolve_season(episode: Episode) -> SeasonSchema:
        return episode.season

    @staticmethod
    def resolve_next_episode(episode: Episode) -> Episode | None:
        return episode.get_next_episode()

    @staticmethod
    def resolve_sprites(episode: Episode) -> list[VideoSpriteSchema]:
        return episode.video.get_sprites() if episode.video else []


class TitleFilterSchema(FilterSchema):
    title: Annotated[str | None, FilterLookup("title__icontains")] = None
    title__icontains: str | None = None
    content_type: Title.ContentType = None
    content_type_in: str | None = None
    genre: Annotated[
        str | None,
        FilterLookup(["genres__slug__icontains", "genres__name__icontains"]),
    ] = None
    release_date: str | None = None
    release_date__gte: str | None = None
    release_date__lt: str | None = None
    exclude: str | None = None

    def filter_content_type_in(self, value: str) -> Q:
        return Q(content_type__in=value.split(",")) if value else Q()

    def filter_exclude(self, value: str) -> Q:
        return ~Q(id__in=[UUID(pk) for pk in value.split(",")]) if value else Q()


class GenreFilterSchema(FilterSchema):
    slug: Annotated[str | None, FilterLookup("slug__icontains")] = None
    name: Annotated[str | None, FilterLookup("name__icontains")] = None

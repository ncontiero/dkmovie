from typing import TYPE_CHECKING
from typing import Annotated
from uuid import UUID

from django.db.models import Q
from ninja import FilterLookup
from ninja import FilterSchema
from ninja import ModelSchema

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title

if TYPE_CHECKING:
    from dkmovie.videos.schemas import VideoTrackSchema


class GenreSchema(ModelSchema):
    class Meta:
        model = Genre
        fields = ["slug", "name"]


class TitleSchema(ModelSchema):
    duration: int = 0
    is_video_available: bool = False
    first_episode_id: UUID | None = None

    class Meta:
        model = Title
        fields = [
            "id",
            "title",
            "description",
            "content_type",
            "release_date",
            "poster",
            "cover",
            "rating",
            "cast",
            "trailer_url",
        ]

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
            "name",
            "number",
            "overview",
            "poster",
            "air_date",
            "rating",
        ]


class TitleDetailSchema(TitleSchema):
    genres: list[GenreSchema] = []
    seasons: list[SeasonSchema] = []
    tracks: list[VideoTrackSchema] = []

    @staticmethod
    def resolve_tracks(title: Title) -> list[VideoTrackSchema]:
        return title.video.get_tracks() if title.video else []


class EpisodeSchema(ModelSchema):
    duration: int = 0
    is_video_available: bool = False

    class Meta:
        model = Episode
        fields = [
            "id",
            "name",
            "number",
            "overview",
            "still",
            "air_date",
            "rating",
        ]


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

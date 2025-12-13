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


class GenreSchema(ModelSchema):
    class Meta:
        model = Genre
        fields = ["slug", "name"]


class BaseTitleSchema(ModelSchema):
    genres: list[GenreSchema] = []

    class Meta:
        model = Title
        fields = [
            "id",
            "title",
            "description",
            "content_type",
            "release_date",
            "duration",
            "rating",
            "cast",
            "poster",
            "cover",
            "trailer_url",
        ]


class SeasonSchema(ModelSchema):
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


class TitleDetailSchema(BaseTitleSchema):
    seasons: list[SeasonSchema] = []

    class Meta(BaseTitleSchema.Meta):
        fields = BaseTitleSchema.Meta.fields


class EpisodeSchema(ModelSchema):
    class Meta:
        model = Episode
        fields = [
            "id",
            "number",
            "name",
            "overview",
            "still",
            "air_date",
            "duration",
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

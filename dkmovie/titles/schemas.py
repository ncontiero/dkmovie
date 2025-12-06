from typing import Annotated
from uuid import UUID

from django.db.models import Q
from ninja import FilterLookup
from ninja import FilterSchema
from ninja import ModelSchema

from .models import Genre
from .models import Title


class GenreSchema(ModelSchema):
    class Meta:
        model = Genre
        fields = ["slug", "name"]


class TitleSchema(ModelSchema):
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


class TitleFilterSchema(FilterSchema):
    title: Annotated[str | None, FilterLookup("title__icontains")] = None
    content_type: Title.ContentType = None
    genre: Annotated[str | None, FilterLookup("genres__slug__icontains")] = None
    release_date: str | None = None
    release_date__gte: str | None = None
    exclude: str | None = None

    def filter_exclude(self, value: str) -> Q:
        return ~Q(id__in=[UUID(pk) for pk in value.split(",")]) if value else Q()


class GenreFilterSchema(FilterSchema):
    slug: Annotated[str | None, FilterLookup("slug__icontains")] = None
    name: Annotated[str | None, FilterLookup("name__icontains")] = None

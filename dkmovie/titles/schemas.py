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
    title: str | None = None
    title__icontains: str | None = None
    content_type: Title.ContentType = None
    genre: str | None = None
    release_date: str | None = None

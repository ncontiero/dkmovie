from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Genre
from .models import Title


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Title)
class TitleAdmin(admin.ModelAdmin):
    list_display = ("title", "content_type", "release_date", "rating")
    list_filter = ("content_type", "genres", "release_date")
    search_fields = ("title", "description")
    filter_horizontal = ("genres",)
    fieldsets = (
        (
            _("Main Information"),
            {
                "fields": (
                    "title",
                    "description",
                    "content_type",
                    "release_date",
                    "duration",
                ),
            },
        ),
        (
            _("Media"),
            {
                "fields": (
                    "poster",
                    "cover",
                    "trailer_url",
                ),
            },
        ),
        (
            _("Classification"),
            {
                "fields": ("genres", "rating"),
            },
        ),
        (
            _("More Information"),
            {
                "fields": ("cast",),
            },
        ),
    )

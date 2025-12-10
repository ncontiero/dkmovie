from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TranslationAdmin

from .models import Genre
from .models import Title


@admin.register(Genre)
class GenreAdmin(TranslationAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Title)
class TitleAdmin(TranslationAdmin):
    list_display = ("title", "status", "content_type", "release_date", "rating")
    list_filter = ("status", "content_type", "genres", "release_date", "added_by")
    search_fields = ("title", "description", "tmdb_id")
    filter_horizontal = ("genres",)
    readonly_fields = ("created_at",)
    fieldsets = (
        (
            _("Main Information"),
            {
                "fields": (
                    "tmdb_id",
                    "title",
                    "description",
                    "content_type",
                    "status",
                    "duration",
                ),
            },
        ),
        (
            _("Dates"),
            {
                "fields": (
                    "release_date",
                    "created_at",
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
        (
            _("Source"),
            {
                "fields": ("added_by",),
            },
        ),
    )
    actions = ("make_released", "make_awaiting_review", "populate_from_tmdb")

    @admin.action(description=_("Mark as Released"))
    def make_released(self, request, queryset):
        queryset.update(status=Title.Status.RELEASED)

    @admin.action(description=_("Mark as Awaiting Review"))
    def make_awaiting_review(self, request, queryset):
        queryset.update(status=Title.Status.AWAITING_REVIEW)

    @admin.action(description=_("Populate details from TMDB"))
    def populate_from_tmdb(self, request, queryset):
        from .tasks import populate_title_admin_task  # noqa: PLC0415

        for title in queryset:
            if title.tmdb_id:
                populate_title_admin_task.delay(title.tmdb_id, title.content_type)
        self.message_user(
            request,
            _("Selected titles are being populated from TMDB."),
        )

from django.contrib import admin
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TranslationAdmin
from modeltranslation.admin import TranslationTabularInline

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title


@admin.register(Genre)
class GenreAdmin(TranslationAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


class SeasonInline(TranslationTabularInline):
    model = Season
    extra = 0
    ordering = ("number",)
    fields = (
        "number",
        "name",
        "air_date",
        "rating",
        "tmdb_id",
    )
    readonly_fields = ("created_at", "updated_at")
    show_change_link = True


class EpisodeInline(TranslationTabularInline):
    model = Episode
    extra = 0
    ordering = ("number",)
    fields = (
        "number",
        "name",
        "air_date",
        "rating",
        "tmdb_id",
    )
    readonly_fields = ("created_at", "updated_at")
    show_change_link = True


@admin.register(Title)
class TitleAdmin(TranslationAdmin):
    list_display = ("title", "status", "content_type", "release_date", "rating")
    list_filter = ("status", "content_type", "genres", "release_date", "added_by")
    search_fields = ("title", "description", "tmdb_id")
    filter_horizontal = ("genres",)
    readonly_fields = ("tmdb_url", "created_at", "updated_at")
    inlines = [SeasonInline]
    fieldsets = (
        (
            _("Main Information"),
            {
                "fields": (
                    "tmdb_id",
                    "tmdb_url",
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
                    "updated_at",
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

    def tmdb_url(self, obj):
        url = obj.tmdb_url
        if not url:
            return ""
        anchor = f'<a href="{url}" target="_blank" rel="noopener noreferrer">{url}</a>'
        return mark_safe(anchor)  # noqa: S308

    tmdb_url.short_description = _("TMDB URL")
    tmdb_url.allow_tags = True

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


@admin.register(Season)
class SeasonAdmin(TranslationAdmin):
    list_display = ("__str__", "title", "number", "air_date", "rating")
    list_filter = ("air_date",)
    search_fields = ("title__title", "name", "overview")
    autocomplete_fields = ["title"]
    inlines = [EpisodeInline]
    readonly_fields = ("tmdb_url", "created_at", "updated_at")
    fieldsets = (
        (
            _("Season Information"),
            {
                "fields": (
                    "tmdb_id",
                    "tmdb_url",
                    "title",
                    "number",
                    "name",
                    "overview",
                ),
            },
        ),
        (
            _("Media"),
            {
                "fields": ("poster",),
            },
        ),
        (
            _("Dates & Rating"),
            {
                "fields": (
                    "air_date",
                    "rating",
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )
    actions = ("populate_from_tmdb", "populate_episodes_from_tmdb")

    def tmdb_url(self, obj):
        url = obj.tmdb_url
        if not url:
            return ""
        anchor = f'<a href="{url}" target="_blank" rel="noopener noreferrer">{url}</a>'
        return mark_safe(anchor)  # noqa: S308

    tmdb_url.short_description = _("TMDB URL")
    tmdb_url.allow_tags = True

    @admin.action(description=_("Populate Season details from TMDB"))
    def populate_from_tmdb(self, request, queryset):
        from .tasks import populate_seasons_from_tmdb  # noqa: PLC0415

        for season in queryset:
            populate_seasons_from_tmdb.delay(season.tmdb_id, season.title.tmdb_id)
        self.message_user(
            request,
            _("Selected seasons are being populated from TMDB."),
        )

    @admin.action(description=_("Populate Season episodes from TMDB"))
    def populate_episodes_from_tmdb(self, request, queryset):
        from .tasks import populate_episodes_from_tmdb  # noqa: PLC0415

        for season in queryset:
            populate_episodes_from_tmdb.delay(season.id)
        self.message_user(
            request,
            _("Selected episodes are being populated from TMDB."),
        )


@admin.register(Episode)
class EpisodeAdmin(TranslationAdmin):
    list_display = ("__str__", "season", "number", "air_date", "rating")
    list_filter = ("air_date",)
    search_fields = ("season__title__title", "name", "overview")
    autocomplete_fields = ["season"]
    readonly_fields = ("tmdb_url", "created_at", "updated_at")
    fieldsets = (
        (
            _("Episode Information"),
            {
                "fields": (
                    "tmdb_id",
                    "tmdb_url",
                    "season",
                    "number",
                    "name",
                    "overview",
                ),
            },
        ),
        (
            _("Media"),
            {
                "fields": ("still",),
            },
        ),
        (
            _("Details"),
            {
                "fields": (
                    "duration",
                    "rating",
                    "air_date",
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )

    def tmdb_url(self, obj):
        url = obj.tmdb_url
        if not url:
            return ""
        anchor = f'<a href="{url}" target="_blank" rel="noopener noreferrer">{url}</a>'
        return mark_safe(anchor)  # noqa: S308

    tmdb_url.short_description = _("TMDB URL")
    tmdb_url.allow_tags = True

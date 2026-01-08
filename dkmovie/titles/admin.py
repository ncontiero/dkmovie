from django.contrib import admin
from django.contrib.contenttypes.admin import GenericStackedInline
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TranslationAdmin
from modeltranslation.admin import TranslationTabularInline

from dkmovie.videos.models import Video

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title
from .tasks import populate_episode_from_tmdb
from .tasks import populate_episodes_from_tmdb
from .tasks import populate_seasons_from_tmdb
from .tasks import populate_title_admin_task


class TmdbUrlMixin:
    @admin.display(description=_("TMDB Link"))
    def tmdb_url(self, obj):
        url = obj.tmdb_url
        if not url:
            return "-"
        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">🔗 {}</a>',
            url,
            _("TMDB Link"),
        )


class VideoInline(GenericStackedInline):
    model = Video
    extra = 0
    max_num = 1
    show_change_link = True
    readonly_fields = (
        "status_badge",
        "file_links",
        "technical_info",
        "error_log",
        "created_at",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    ("status_badge", "technical_info"),
                    "source_file",
                ),
            },
        ),
        (
            _("Streaming Data"),
            {
                "classes": ("collapse",),
                "fields": ("file_links", "error_log"),
            },
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("sprites")

    @admin.display(description=_("Status"))
    def status_badge(self, obj):
        colors = {
            Video.Status.COMPLETED: "green",
            Video.Status.PROCESSING: "orange",
            Video.Status.PENDING: "#666",
            Video.Status.FAILED: "red",
        }
        color = colors.get(obj.status, "gray")

        extra_text = ""
        if obj.status == Video.Status.FAILED:
            extra_text = f" ⚠️ ({_('Check Logs')})"

        return format_html(
            '<div style="background-color: {}; color: white; padding: 5px 10px; '
            'border-radius: 4px; display: inline-block; font-weight: bold;">'
            "{}</div>{}",
            color,
            obj.get_status_display(),
            extra_text,
        )

    @admin.display(description=_("Streaming Files"))
    def file_links(self, obj):
        links = []

        if obj.hls_playlist:
            links.append(
                format_html(
                    '📺 <a href="{}" target="_blank">{}</a>',
                    obj.hls_playlist.url,
                    _("Master Playlist (M3U8)"),
                ),
            )
        else:
            links.append(
                format_html(
                    '<span style="color:orange">{}</span>',
                    _("Waiting HLS..."),
                ),
            )

        sprite_count = obj.sprites.count()
        if sprite_count > 0:
            links.append(
                format_html(
                    "🖼️ <b>{}</b> {}",
                    sprite_count,
                    _("Sprite Sheets generated"),
                ),
            )
        else:
            links.append(
                format_html(
                    "🖼️ {}",
                    _("No Sprites"),
                ),
            )

        return mark_safe(" <br> ".join(links))  # noqa: S308

    @admin.display(description=_("Technical Info"))
    def technical_info(self, obj):
        if not obj.duration:
            duration_str = _("Calculating...")
        else:
            m, s = divmod(obj.duration, 60)
            duration_str = f"{int(m)}m {int(s)}s"

        return format_html(
            "<b>{}:</b> {}<br>"
            "<b>{}:</b> {}<br>"
            "<b>{}:</b> <span style='font-family:monospace; font-size:11px'>{}</span>",
            _("Duration"),
            duration_str,
            _("Created"),
            obj.created_at.strftime("%Y-%m-%d %H:%M"),
            _("Video ID"),
            obj.id,
        )

    @admin.display(description=_("Processing Logs"))
    def error_log(self, obj):
        if obj.processing_error:
            return format_html(
                '<pre style="color: red; background: #ffeeee; padding: 10px; border: 1px solid red; white-space: pre-wrap;">{}</pre>',  # noqa: E501
                obj.processing_error,
            )
        return format_html(
            '<span style="color: green">{}</span>',
            _("No errors reported."),
        )

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Genre)
class GenreAdmin(TranslationAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Title)
class TitleAdmin(TmdbUrlMixin, TranslationAdmin):
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

    list_display = ("title", "status", "content_type", "release_date", "rating")
    list_filter = ("status", "content_type", "genres", "release_date", "added_by")
    search_fields = ("title", "description", "tmdb_id")
    filter_horizontal = ("genres",)
    readonly_fields = ("tmdb_url", "created_at", "updated_at")
    inlines = [VideoInline, SeasonInline]
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

    @admin.action(description=_("Mark as Released"))
    def make_released(self, request, queryset):
        queryset.update(status=Title.Status.RELEASED)

    @admin.action(description=_("Mark as Awaiting Review"))
    def make_awaiting_review(self, request, queryset):
        queryset.update(status=Title.Status.AWAITING_REVIEW)

    @admin.action(description=_("Populate details from TMDB"))
    def populate_from_tmdb(self, request, queryset):
        for title in queryset:
            if title.tmdb_id:
                populate_title_admin_task.delay(title.tmdb_id, title.content_type)
        self.message_user(
            request,
            _("Selected titles are being populated from TMDB."),
        )


@admin.register(Season)
class SeasonAdmin(TmdbUrlMixin, TranslationAdmin):
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

    list_display = ("__str__", "title", "number", "air_date", "rating")
    list_filter = ("number", "air_date")
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

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("title")

    @admin.action(description=_("Populate Season details from TMDB"))
    def populate_from_tmdb(self, request, queryset):
        for season in queryset:
            title = season.title
            if not title.tmdb_id:
                continue
            season_details = [{"number": season.number}]
            populate_seasons_from_tmdb.delay(title.id, title.tmdb_id, season_details)
        self.message_user(
            request,
            _("Selected seasons are being populated from TMDB."),
        )

    @admin.action(description=_("Populate Season episodes from TMDB"))
    def populate_episodes_from_tmdb(self, request, queryset):
        for season in queryset:
            populate_episodes_from_tmdb.delay(season.id)
        self.message_user(
            request,
            _("Selected episodes are being populated from TMDB."),
        )


@admin.register(Episode)
class EpisodeAdmin(TmdbUrlMixin, TranslationAdmin):
    list_display = ("__str__", "season", "number", "air_date", "rating")
    list_filter = ("air_date",)
    search_fields = ("season__title__title", "name", "overview")
    autocomplete_fields = ["season"]
    inlines = [VideoInline]
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
                    "rating",
                    "air_date",
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )
    actions = ("populate_from_tmdb",)

    @admin.action(description=_("Populate Episode details from TMDB"))
    def populate_from_tmdb(self, request, queryset):
        for episode in queryset:
            populate_episode_from_tmdb.delay(episode.season.id, episode.number)
        self.message_user(
            request,
            _("Selected episodes are being populated from TMDB."),
        )

import contextlib

from django.contrib import admin
from django.contrib.contenttypes.admin import GenericStackedInline
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TranslationAdmin
from modeltranslation.admin import TranslationTabularInline

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title
from .models import Video
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
    fields = ("source_file", "duration")
    readonly_fields = ("created_at", "updated_at")
    show_change_link = True


@admin.register(Genre)
class GenreAdmin(TranslationAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "get_target_name",
        "get_target_type",
        "get_duration_fmt",
        "created_at",
        "link_to_parent",
    )
    list_filter = ("content_type", "created_at")
    search_fields = ("id", "source_file")
    readonly_fields = ("created_at", "updated_at", "link_to_parent_large")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("content_object")

    def get_search_results(self, request, queryset, search_term):
        """
        Custom search for VideoAdmin to include searching by
        related Title/Episode names.
        """
        queryset, use_distinct = super().get_search_results(
            request,
            queryset,
            search_term,
        )

        if not search_term:
            return queryset, use_distinct

        with contextlib.suppress(Exception):
            title_ct = ContentType.objects.get_for_model(Title)
            matching_titles = Title.objects.filter(
                title__icontains=search_term,
            ).values_list("id", flat=True)

            episode_ct = ContentType.objects.get_for_model(Episode)
            matching_episodes = Episode.objects.filter(
                season__title__title__icontains=search_term,
            ).values_list("id", flat=True)

            queryset |= self.model.objects.filter(
                Q(content_type=title_ct, object_id__in=matching_titles)
                | Q(content_type=episode_ct, object_id__in=matching_episodes),
            )

        return queryset, use_distinct

    @admin.display(description=_("Content Name"))
    def get_target_name(self, obj):
        return str(obj.content_object) if obj.content_object else "-"

    @admin.display(description=_("Type"))
    def get_target_type(self, obj):
        return obj.content_type.model.title() if obj.content_type else "-"

    @admin.display(description=_("Duration"), ordering="duration")
    def get_duration_fmt(self, obj):
        if not obj.duration:
            return "0s"
        m, s = divmod(obj.duration, 60)
        h, m = divmod(m, 60)
        minutes_with_seconds = f"{m:02d}:{s:02d}"
        if h == 0:
            return minutes_with_seconds
        two_decimal = 10
        hour = f"{h:02d}" if h > two_decimal else f"{h:01d}"
        return f"{hour}:{minutes_with_seconds}"

    @admin.display(description=_("Parent Link"))
    def link_to_parent(self, obj):
        if obj.content_object:
            ct = obj.content_type
            url = reverse(
                f"admin:{ct.app_label}_{ct.model}_change",
                args=[obj.object_id],
            )
            return format_html(
                '<a href="{}" class="button" style="padding:3px 8px;">{}</a>',
                url,
                _("View Parent"),
            )
        return "-"

    @admin.display(description=_("Parent Object"))
    def link_to_parent_large(self, obj):
        if obj.content_object:
            ct = obj.content_type
            url = reverse(
                f"admin:{ct.app_label}_{ct.model}_change",
                args=[obj.object_id],
            )
            return format_html(
                '<a href="{}">{} ({})</a>',
                url,
                obj.content_object,
                _("Click to edit"),
            )
        return _("Orphaned Video")


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

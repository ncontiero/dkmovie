import contextlib

from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.urls import reverse
from django.utils.html import format_html
from django.utils.html import format_html_join
from django.utils.translation import gettext_lazy as _
from modeltranslation.admin import TranslationAdmin

from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title

from .models import Video
from .models import VideoSprite
from .models import VideoTrack
from .tasks import discover_tracks_task
from .tasks import generate_video_sprites_task
from .tasks import process_track_task


class VideoSpriteInline(admin.TabularInline):
    model = VideoSprite
    extra = 0
    ordering = ("start_time",)
    fields = (
        "sprite_preview",
        "start_time",
        "end_time",
        "interval",
        "grid_info",
        "image",
    )
    readonly_fields = ("sprite_preview", "grid_info")
    can_delete = True
    show_change_link = True
    verbose_name = _("Sprite Sheet")
    verbose_name_plural = _("Sprite Sheets")

    @admin.display(description=_("Preview"))
    def sprite_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 40px; border: 1px solid #ccc;" />',
                obj.image.url,
            )
        return "-"

    @admin.display(description=_("Grid (WxH)"))
    def grid_info(self, obj):
        return f"{obj.columns}x{obj.rows} ({obj.frame_width}px)"


class VideoTrackInline(admin.TabularInline):
    model = VideoTrack
    extra = 0
    show_change_link = True
    verbose_name = _("Media Track")
    verbose_name_plural = _("Media Tracks (Audio/Subs)")

    fields = (
        "active_icons",
        "language",
        "label",
        "is_original",
        "subtitle_file",
        "audio_playlist",
        "source_indices_display",
    )
    readonly_fields = ("active_icons", "source_indices_display")

    @admin.display(description=_("Status"))
    def active_icons(self, obj):
        icons_data = []
        if obj.is_default:
            icons_data.append(
                ("⭐", _("Default Track"), "cursor:help; margin-right:5px"),
            )
        else:
            icons_data.append(("⭐", "", "opacity:0.1; margin-right:5px"))

        if obj.audio_playlist:
            icons_data.append(
                ("🔊", _("Audio Available"), "color:blue; margin-left:5px"),
            )
        else:
            icons_data.append(
                (
                    "🔊",
                    _("No Audio"),
                    "opacity:0.2; filter:grayscale(1); margin-left:5px",
                ),
            )

        if obj.subtitle_file:
            icons_data.append(
                ("📝", _("Subtitle Available"), "color:green; margin-left:5px"),
            )
        else:
            icons_data.append(
                (
                    "📝",
                    _("No Subtitle"),
                    "opacity:0.2; filter:grayscale(1); margin-left:5px",
                ),
            )

        return format_html_join(
            "",
            '<span title="{1}" style="{2}">{0}</span>',
            ((icon, title, style) for icon, title, style in icons_data),
        )

    @admin.display(description=_("Source Indexes"))
    def source_indices_display(self, obj):
        parts_data = []
        if obj.source_audio_index is not None:
            parts_data.append(("A:", obj.source_audio_index))

        if obj.source_subtitle_index is not None:
            parts_data.append(("S:", obj.source_subtitle_index))

        if not parts_data:
            return "-"

        return format_html_join(
            " <span style='color:#ccc'>|</span> ",
            "<b>{0}</b> {1}",
            ((label, value) for label, value in parts_data),
        )


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "get_target_name",
        "get_target_type",
        "status",
        "get_duration_fmt",
        "created_at",
        "link_to_parent",
    )
    list_filter = ("status", "content_type", "created_at")
    search_fields = ("id", "source_file")
    readonly_fields = ("id", "created_at", "updated_at", "link_to_parent_large")
    inlines = [VideoSpriteInline, VideoTrackInline]
    actions = [
        "retry_processing",
        "generate_sprites",
        "discover_tracks",
        "process_tracks",
    ]

    fieldsets = (
        (
            _("General Information"),
            {
                "fields": (
                    "id",
                    "status",
                    "link_to_parent_large",
                    "duration",
                ),
            },
        ),
        (
            _("Files & Streaming"),
            {
                "fields": (
                    "source_file",
                    "hls_playlist",
                ),
                "description": _(
                    "Paths to the source file and the generated HLS master playlist.",
                ),
            },
        ),
        (
            _("Internal References"),
            {
                "classes": ("collapse",),
                "fields": ("content_type", "object_id"),
            },
        ),
        (
            _("Logs & Debug"),
            {
                "classes": ("collapse",),
                "fields": (
                    "processing_error",
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )

    def get_queryset(self, request):
        return (
            super().get_queryset(request).prefetch_related("content_object", "sprites")
        )

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

    @admin.action(description=_("Retry Processing"))
    def retry_processing(self, request, queryset):
        count = queryset.update(status=Video.Status.PENDING)
        self.message_user(request, _("%s videos queued for reprocessing.") % count)

    @admin.action(description=_("Generate Sprite Sheets"))
    def generate_sprites(self, request, queryset):
        for video in queryset:
            generate_video_sprites_task.delay(video.id)
        self.message_user(
            request,
            _("%s videos queued for sprite generation.") % queryset.count(),
        )

    @admin.action(description=_("Discover Tracks"))
    def discover_tracks(self, request, queryset):
        for video in queryset:
            discover_tracks_task.delay(video.id)
        self.message_user(
            request,
            _("%s videos queued for track discovery.") % queryset.count(),
        )

    @admin.action(description=_("Process Tracks"))
    def process_tracks(self, request, queryset):
        for video in queryset:
            for track in video.tracks.all():
                process_track_task.delay(track.id)
        self.message_user(
            request,
            _("%s videos queued for track processing.") % queryset.count(),
        )


@admin.register(VideoSprite)
class VideoSpriteAdmin(admin.ModelAdmin):
    list_display = (
        "sprite_preview_large",
        "video_link",
        "time_range",
        "interval",
        "dimensions",
        "grid_layout",
        "created_at",
    )
    list_filter = ("interval", "created_at")
    search_fields = ("video__id",)
    readonly_fields = ("created_at", "sprite_preview_detail")

    fieldsets = (
        (
            _("File Info"),
            {
                "fields": ("video", "image", "sprite_preview_detail"),
            },
        ),
        (
            _("Timing"),
            {
                "fields": (("start_time", "end_time"), "interval"),
            },
        ),
        (
            _("Technical Dimensions"),
            {
                "fields": (
                    ("frame_width", "frame_height"),
                    ("columns", "rows"),
                ),
            },
        ),
    )

    @admin.display(description=_("Preview"))
    def sprite_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 100px; object-fit: cover;" />',  # noqa: E501
                obj.image.url,
            )
        return "-"

    @admin.display(description=_("Full Preview"))
    def sprite_preview_detail(self, obj):
        if obj.image:
            return format_html(
                '<a href="{0}" target="_blank"><img src="{0}" style="max-width: 100%; height: auto;" /></a>',  # noqa: E501
                obj.image.url,
            )
        return "-"

    @admin.display(description=_("Video"), ordering="video")
    def video_link(self, obj):
        url = reverse("admin:videos_video_change", args=[obj.video.id])
        return format_html('<a href="{}">{}</a>', url, str(obj.video))

    @admin.display(description=_("Time Range"), ordering="start_time")
    def time_range(self, obj):
        return f"{obj.start_time}s - {obj.end_time}s"

    @admin.display(description=_("Thumb Size"))
    def dimensions(self, obj):
        return f"{obj.frame_width}x{obj.frame_height}px"

    @admin.display(description=_("Grid"))
    def grid_layout(self, obj):
        return f"{obj.columns}x{obj.rows}"


@admin.register(VideoTrack)
class VideoTrackAdmin(TranslationAdmin):
    list_display = (
        "get_video_name",
        "language_badge",
        "label",
        "has_audio",
        "has_subtitle",
        "is_original",
        "created_at",
    )
    list_filter = (
        "language",
        "is_original",
        ("audio_playlist", admin.EmptyFieldListFilter),
        ("subtitle_file", admin.EmptyFieldListFilter),
    )
    search_fields = (
        "video__id",
        "video__source_file",
        "label",
        "language",
    )
    autocomplete_fields = ["video"]

    fieldsets = (
        (
            _("Association"),
            {
                "fields": ("video", "language", "label", "is_original"),
            },
        ),
        (
            _("Media Assets"),
            {
                "fields": (
                    ("audio_playlist", "source_audio_index"),
                    ("subtitle_file", "source_subtitle_index"),
                ),
                "description": _(
                    "Upload processed files manually or set the source index for auto-extraction.",  # noqa: E501
                ),
            },
        ),
    )

    @admin.display(description=_("Video"), ordering="video")
    def get_video_name(self, obj):
        return (
            str(obj.video.content_object)
            if obj.video.content_object
            else str(obj.video)
        )

    @admin.display(description=_("Lang"), ordering="language")
    def language_badge(self, obj):
        return format_html(
            '<span style="background:#eee; color:#333; padding:2px 6px; border-radius:3px; font-weight:bold; font-family:monospace">{}</span>',  # noqa: E501
            obj.language.upper(),
        )

    @admin.display(description=_("Audio"), boolean=True)
    def has_audio(self, obj):
        return bool(obj.audio_playlist)

    @admin.display(description=_("Subtitle"), boolean=True)
    def has_subtitle(self, obj):
        return bool(obj.subtitle_file)

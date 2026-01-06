import contextlib

from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title

from .models import Video


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
    readonly_fields = ("created_at", "updated_at", "link_to_parent_large")
    actions = ["retry_processing"]

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

    @admin.action(description=_("Retry Processing"))
    def retry_processing(self, request, queryset):
        for video in queryset:
            video.status = Video.Status.PENDING
            video.save()
        self.message_user(request, _("Selected videos queued for processing."))

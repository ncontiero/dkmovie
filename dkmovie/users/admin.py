from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.utils.translation import gettext_lazy as _

from .models import HistoryEntry
from .models import SavedTitle
from .models import User

admin.site.register(HistoryEntry)
admin.site.register(SavedTitle)


class HistoryEntryInline(admin.TabularInline):
    model = HistoryEntry
    extra = 0


class SavedTitleInline(admin.TabularInline):
    model = SavedTitle
    extra = 0


@admin.register(User)
class UserAdmin(auth_admin.UserAdmin):
    inlines = [HistoryEntryInline, SavedTitleInline]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("name",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    list_display = ["email", "name", "is_superuser"]
    search_fields = ["name"]
    ordering = ["id"]
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )

from allauth.account.decorators import secure_admin_login
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include
from django.urls import path
from django.urls import re_path
from django.views.generic import TemplateView

from .api.main import api

admin.autodiscover()
admin.site.login = secure_admin_login(admin.site.login)

api_urlpatterns = [
    path("", api.urls),
    path("auth/", include("allauth.headless.urls")),
]

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    # User management
    path("accounts/", include("allauth.urls")),
    # API base url
    path("api/", include(api_urlpatterns)),
    # Media files
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    # Catch all
    re_path(
        r"^.*$",
        TemplateView.as_view(template_name="pages/home.html"),
        name="home",
    ),
]


if settings.DEBUG:
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [
            path("__debug__/", include(debug_toolbar.urls)),
            *urlpatterns,
        ]

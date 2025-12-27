from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TitlesConfig(AppConfig):
    verbose_name = _("Titles")
    name = "dkmovie.titles"

    def ready(self):
        import dkmovie.titles.signals  # noqa: F401, PLC0415

from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title


@register(Genre)
class GenreTranslationOptions(TranslationOptions):
    fields = ("name",)


@register(Title)
class TitleTranslationOptions(TranslationOptions):
    fields = ("title", "description")


@register(Season)
class SeasonTranslationOptions(TranslationOptions):
    fields = ("name", "overview")


@register(Episode)
class EpisodeTranslationOptions(TranslationOptions):
    fields = ("name", "overview")

from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from .models import Genre
from .models import Title


@register(Genre)
class GenreTranslationOptions(TranslationOptions):
    fields = ("name",)


@register(Title)
class TitleTranslationOptions(TranslationOptions):
    fields = ("title", "description")

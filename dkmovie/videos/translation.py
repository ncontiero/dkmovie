from modeltranslation.translator import TranslationOptions
from modeltranslation.translator import register

from .models import VideoTrack


@register(VideoTrack)
class GenreTranslationOptions(TranslationOptions):
    fields = ("label",)

from __future__ import annotations

from typing import TYPE_CHECKING

from django.conf import settings
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from ninja import Router

from config.api.utils import ApiProcessError

if TYPE_CHECKING:
    from django.http import HttpRequest
    from django.http import HttpResponse

    from dkmovie.users.schemas import LanguageSchema

LANGUAGE_COOKIE_NAME = settings.LANGUAGE_COOKIE_NAME
SUPPORTED_LANGUAGES = dict(settings.LANGUAGES)

router = Router()


@router.post("/set-language")
def set_language(request: HttpRequest, response: HttpResponse, payload: LanguageSchema):
    language = payload.language
    if language not in SUPPORTED_LANGUAGES:
        raise ApiProcessError(400, _("Language not supported"))

    translation.activate(language)
    response.set_cookie(LANGUAGE_COOKIE_NAME, language)
    return {"language": language}

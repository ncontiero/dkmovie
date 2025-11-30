from django.conf import settings
from django.http import HttpRequest
from django.http import HttpResponse
from django.utils import translation
from ninja import Router

from config.api.utils import ApiProcessError
from dkmovie.users.schemas import LanguageSchema

LANGUAGE_COOKIE_NAME = settings.LANGUAGE_COOKIE_NAME
SUPPORTED_LANGUAGES = dict(settings.LANGUAGES)

router = Router()


@router.post("/set-language")
def set_language(request: HttpRequest, response: HttpResponse, payload: LanguageSchema):
    language = payload.language
    if language not in SUPPORTED_LANGUAGES:
        raise ApiProcessError(400, "Language not supported")

    translation.activate(language)
    response.set_cookie(LANGUAGE_COOKIE_NAME, language)
    return {"language": language}

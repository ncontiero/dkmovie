import orjson
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpRequest
from django.utils.translation import gettext_lazy as _
from ninja import NinjaAPI
from ninja.errors import ValidationError as NinjaValidationError
from ninja.parser import Parser

from dkmovie.streaming.api import router as streaming_router
from dkmovie.titles.api import router as titles_router
from dkmovie.upload.api import router as upload_router
from dkmovie.users.api import router as users_router

from .utils import ApiProcessError
from .utils import api_error


class ORJSONParser(Parser):
    def parse_body(self, request: HttpRequest):
        return orjson.loads(request.body)


api = NinjaAPI(
    parser=ORJSONParser(),
    docs_decorator=staff_member_required,
    title=_("DkMovie API"),
    description=_("Documentation of API endpoints of DkMovie"),
    version="1.0.0",
)


@api.exception_handler(NinjaValidationError)
def ninja_validation_error_handler(request, exc: NinjaValidationError):
    messages = [f"{error['loc']!s}: {error['msg']}" for error in exc.errors]
    status, response = api_error(400, "Validation Error", "\n".join(messages))
    return api.create_response(request, response, status=status)


@api.exception_handler(ApiProcessError)
def api_error_handler(request, exc: ApiProcessError):
    status, response = api_error(exc.status_code, exc.message, exc.full_message)
    return api.create_response(request, response, status=status)


@api.exception_handler(Exception)
def exception_handler(request, exc: Exception):
    status, response = api_error(500, "Internal Server Error", str(exc))
    return api.create_response(request, response, status=status)


api.add_router("/", titles_router)
api.add_router("/", users_router)
api.add_router("/streaming", streaming_router)
api.add_router("/upload", upload_router)

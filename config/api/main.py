import orjson
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpRequest
from ninja import NinjaAPI
from ninja.parser import Parser

from dkmovie.titles.api import router as titles_router

from .utils import ApiProcessError
from .utils import api_error


class ORJSONParser(Parser):
    def parse_body(self, request: HttpRequest):
        return orjson.loads(request.body)


api = NinjaAPI(
    parser=ORJSONParser(),
    docs_decorator=staff_member_required,
    title="DkMovie API",
    description="Documentation of API endpoints of DkMovie",
    version="1.0.0",
)


@api.exception_handler(ApiProcessError)
def api_error_handler(request, exc: ApiProcessError):
    status, response = api_error(exc.status_code, exc.message, exc.full_message)
    return api.create_response(request, response, status=status)


@api.exception_handler(Exception)
def exception_handler(request, exc: Exception):
    status, response = api_error(500, "Internal Server Error", str(exc))
    return api.create_response(request, response, status=status)


api.add_router("/", titles_router)

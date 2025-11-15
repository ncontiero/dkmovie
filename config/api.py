import orjson
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpRequest
from ninja import NinjaAPI
from ninja.parser import Parser

from dkmovie.titles.api import router as titles_router


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

api.add_router("/", titles_router)

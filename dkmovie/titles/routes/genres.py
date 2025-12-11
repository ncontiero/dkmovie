from django.utils.translation import gettext_lazy as _
from django.views.decorators.cache import cache_page
from ninja import Query
from ninja import Router
from ninja.decorators import decorate_view
from ninja.pagination import paginate

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Genre
from dkmovie.titles.schemas import GenreFilterSchema
from dkmovie.titles.schemas import GenreSchema

router = Router()


@router.get("/", response={200: list[GenreSchema]})
@decorate_view(cache_page(3600))
@paginate
def get_titles(request, filters: GenreFilterSchema = Query(...)):  # noqa: B008
    genres = Genre.objects.all()
    try:
        return filters.filter(genres)
    except ValueError as err:
        raise ApiProcessError(400, _("Invalid filter parameter."), err) from err

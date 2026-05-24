from typing import TYPE_CHECKING

from django.utils.translation import gettext_lazy as _
from django.views.decorators.cache import cache_page
from ninja import Query
from ninja import Router
from ninja.decorators import decorate_view
from ninja.pagination import PageNumberPagination
from ninja.pagination import paginate

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title
from dkmovie.titles.schemas import EpisodeSchema
from dkmovie.titles.schemas import TitleDetailSchema
from dkmovie.titles.schemas import TitleFilterSchema
from dkmovie.titles.schemas import TitleSchema

if TYPE_CHECKING:
    from uuid import UUID

router = Router()


@router.get("/", response={200: list[TitleSchema]})
@decorate_view(cache_page(3600))
@paginate(PageNumberPagination, page_size=10)
def get_titles(
    request,
    filters: TitleFilterSchema = Query(...),  # noqa: B008
    order_by: str | None = None,
):
    titles = Title.objects.prefetch_related("videos").filter(
        status=Title.Status.RELEASED,
    )
    try:
        filtered_titles = filters.filter(titles)
        if order_by:
            return filtered_titles.order_by(order_by)
    except ValueError as err:
        raise ApiProcessError(400, _("Invalid filter parameter."), err) from err
    else:
        return filtered_titles


@router.get("/{title_id}", response={200: TitleDetailSchema})
@decorate_view(cache_page(3600))
def get_title(request, title_id: UUID):
    try:
        return Title.objects.prefetch_related("genres", "seasons").get(
            id=title_id,
            status=Title.Status.RELEASED,
        )
    except Title.DoesNotExist as err:
        raise ApiProcessError(404, _("The title does not exist.")) from err


@router.get(
    "/{title_id}/season/{season_number}/episodes",
    response={200: list[EpisodeSchema]},
)
@decorate_view(cache_page(3600))
def get_episodes(request, title_id: UUID, season_number: int):
    return Episode.objects.filter(
        season__title__id=title_id,
        season__number=season_number,
    ).order_by("number")

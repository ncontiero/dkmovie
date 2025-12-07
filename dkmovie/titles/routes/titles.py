from uuid import UUID

from django.utils.translation import gettext_lazy as _
from ninja import Query
from ninja import Router
from ninja.pagination import PageNumberPagination
from ninja.pagination import paginate

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Title
from dkmovie.titles.schemas import TitleFilterSchema
from dkmovie.titles.schemas import TitleSchema

router = Router()


@router.get("/", response={200: list[TitleSchema]})
@paginate(PageNumberPagination, page_size=10)
def get_titles(
    request,
    filters: TitleFilterSchema = Query(...),  # noqa: B008
    order_by: str | None = None,
):
    titles = Title.objects.all()
    try:
        filtered_titles = filters.filter(titles)
        if order_by:
            return filtered_titles.order_by(order_by)
    except ValueError as err:
        raise ApiProcessError(400, _("Invalid filter parameter."), err) from err
    else:
        return filtered_titles


@router.get("/{title_id}", response={200: TitleSchema})
def get_title(request, title_id: UUID):
    try:
        return Title.objects.get(id=title_id)
    except Title.DoesNotExist as err:
        raise ApiProcessError(404, _("The title does not exist.")) from err

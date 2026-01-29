from typing import TYPE_CHECKING
from uuid import UUID

from django.http import HttpRequest
from django.utils.translation import gettext_lazy as _
from ninja import Query
from ninja import Router
from ninja.pagination import PageNumberPagination
from ninja.pagination import paginate
from ninja.security import SessionAuth

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Title
from dkmovie.titles.schemas import TitleFilterSchema
from dkmovie.titles.schemas import TitleSchema

if TYPE_CHECKING:
    from dkmovie.users.models import User

router = Router(auth=SessionAuth())


@router.get("/", response={200: list[TitleSchema]})
@paginate(PageNumberPagination, page_size=10)
def get_my_list(request: HttpRequest, filters: TitleFilterSchema = Query(...)):  # noqa: B008
    user: User = request.user
    saved_titles = user.my_list.prefetch_related("videos").filter(
        status=Title.Status.RELEASED,
    )
    try:
        return filters.filter(saved_titles)
    except ValueError as err:
        raise ApiProcessError(400, _("Invalid filter parameter."), err) from err


@router.post("/{title_id}", response={200: list[UUID]})
def add_to_my_list(request: HttpRequest, title_id: UUID):
    user: User = request.user

    try:
        title = Title.objects.get(id=title_id)
    except Title.DoesNotExist as e:
        raise ApiProcessError(404, _("The title does not exist.")) from e

    user.my_list.add(title)
    return 200, user.my_list.values_list("id", flat=True)


@router.delete("/{title_id}", response={200: list[UUID]})
def remove_from_my_list(request: HttpRequest, title_id: UUID):
    user: User = request.user

    try:
        title = Title.objects.get(id=title_id)
    except Title.DoesNotExist as e:
        raise ApiProcessError(404, _("The title does not exist.")) from e

    user.my_list.remove(title)
    return 200, user.my_list.values_list("id", flat=True)

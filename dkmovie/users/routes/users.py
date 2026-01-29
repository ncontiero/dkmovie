from typing import TYPE_CHECKING

from django.http import HttpRequest
from django.utils.translation import gettext_lazy as _
from ninja import Router
from ninja.security import SessionAuth

from config.api.utils import ApiProcessError
from dkmovie.users.schemas import UserSchemaIn
from dkmovie.users.schemas import UserSchemaOut
from dkmovie.users.tasks import send_account_deleted_email_task

if TYPE_CHECKING:
    from dkmovie.users.models import User

router = Router(auth=SessionAuth())

MAX_NAME_LENGTH = 255
MIN_NAME_LENGTH = 4


@router.get("", response={200: UserSchemaOut})
def me(request: HttpRequest):
    user: User = request.user
    return user


@router.patch("", response={200: UserSchemaOut})
def update_me(request: HttpRequest, payload: UserSchemaIn):
    user: User = request.user

    if not payload.name:
        raise ApiProcessError(400, _("Name is required"))
    if payload.name == user.name:
        raise ApiProcessError(400, _("Name is the same"))
    if len(payload.name) < MIN_NAME_LENGTH:
        raise ApiProcessError(400, _("Name is too short"))
    if len(payload.name) > MAX_NAME_LENGTH:
        raise ApiProcessError(400, _("Name is too long"))

    user.name = payload.name
    user.save(update_fields=["name"])
    return user


@router.delete("", response={204: None})
def delete_me(request: HttpRequest):
    user: User = request.user
    user.delete()
    send_account_deleted_email_task.delay(
        user.name,
        user.email,
        request.LANGUAGE_CODE,
    )

    return 204, None

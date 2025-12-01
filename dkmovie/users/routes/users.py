from django.utils.translation import gettext_lazy as _
from ninja import Router

from config.api.utils import ApiProcessError
from dkmovie.users.models import User
from dkmovie.users.schemas import UserSchemaIn
from dkmovie.users.schemas import UserSchemaOut

router = Router()


MAX_NAME_LENGTH = 255
MIN_NAME_LENGTH = 4


@router.get("/me", response={200: UserSchemaOut})
def me(request):
    try:
        if request.user.is_anonymous:
            raise ApiProcessError(401, _("Unauthorized"))
        user = User.objects.get(id=request.user.id)
    except User.DoesNotExist as err:
        raise ApiProcessError(404, _("User not found")) from err
    else:
        return {"id": user.id, "name": user.name, "email": user.email}


@router.patch("/me", response={200: UserSchemaOut})
def update_me(request, payload: UserSchemaIn):
    try:
        if request.user.is_anonymous:
            raise ApiProcessError(401, _("Unauthorized"))

        if not payload.name:
            raise ApiProcessError(400, _("Name is required"))
        if payload.name == request.user.name:
            raise ApiProcessError(400, _("Name is the same"))
        if len(payload.name) < MIN_NAME_LENGTH:
            raise ApiProcessError(400, _("Name is too short"))
        if len(payload.name) > MAX_NAME_LENGTH:
            raise ApiProcessError(400, _("Name is too long"))

        user = User.objects.get(id=request.user.id)
    except User.DoesNotExist as err:
        raise ApiProcessError(404, _("User not found")) from err
    else:
        user.name = payload.name
        user.save(update_fields=["name"])
        return {"id": user.id, "name": user.name, "email": user.email}


@router.delete("/me", response={204: None})
def delete_me(request):
    try:
        if request.user.is_anonymous:
            raise ApiProcessError(401, _("Unauthorized"))
        user = User.objects.get(id=request.user.id)
    except User.DoesNotExist as err:
        raise ApiProcessError(404, _("User not found")) from err
    else:
        user.delete()
        return

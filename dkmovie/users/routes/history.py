from typing import TYPE_CHECKING

from django.utils.translation import gettext_lazy as _
from ninja import Router
from ninja.security import SessionAuth

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title
from dkmovie.titles.schemas import TitleSchema
from dkmovie.users.schemas import AddToHistorySchema
from dkmovie.users.schemas import HistoryEntrySchema

if TYPE_CHECKING:
    from django.http import HttpRequest

    from dkmovie.users.models import User

router = Router(auth=SessionAuth())


@router.get("", response={200: list[TitleSchema]})
def get_my_history(request: HttpRequest):
    user: User = request.user
    my_history = user.history.prefetch_related("videos").all()
    return 200, my_history


@router.post("", response={200: list[HistoryEntrySchema]})
def add_to_my_history(request: HttpRequest, payload: AddToHistorySchema):
    user: User = request.user

    try:
        title = Title.objects.get(id=payload.title_id)
    except Title.DoesNotExist as e:
        raise ApiProcessError(404, _("The title does not exist.")) from e

    episode = None
    if payload.episode_id:
        try:
            episode = Episode.objects.get(id=payload.episode_id, season__title=title)
        except Episode.DoesNotExist as e:
            raise ApiProcessError(
                404,
                _("The episode does not exist for the given title."),
            ) from e

    user.update_history(
        title=title,
        seconds=payload.watched_seconds,
        episode=episode,
        watched=payload.watched,
    )
    return 200, user.get_history_entries()

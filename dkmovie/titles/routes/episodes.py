from uuid import UUID

from django.utils.translation import gettext_lazy as _
from django.views.decorators.cache import cache_page
from ninja import Router
from ninja.decorators import decorate_view

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Episode
from dkmovie.titles.schemas import EpisodeSchema

router = Router()


@router.get("/{episode_id}", response={200: EpisodeSchema})
@decorate_view(cache_page(3600))
def get_episode(request, episode_id: UUID):
    try:
        return Episode.objects.get(id=episode_id)
    except Episode.DoesNotExist as err:
        raise ApiProcessError(404, _("The episode does not exist.")) from err

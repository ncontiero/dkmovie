from uuid import UUID

from django.utils.translation import gettext_lazy as _
from django.views.decorators.cache import cache_page
from ninja import Router
from ninja.decorators import decorate_view

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Episode
from dkmovie.titles.schemas import EpisodeSchema
from dkmovie.titles.services.streaming import get_video_streaming_response

router = Router()


@router.get("/{episode_id}", response={200: EpisodeSchema})
@decorate_view(cache_page(3600))
def get_episode(request, episode_id: UUID):
    try:
        return Episode.objects.get(id=episode_id)
    except Episode.DoesNotExist as err:
        raise ApiProcessError(404, _("The episode does not exist.")) from err


@router.get("/{episode_id}/stream")
def stream_episode(request, episode_id: UUID):
    try:
        episode = Episode.objects.get(id=episode_id)
    except Episode.DoesNotExist as err:
        raise ApiProcessError(404, _("The episode does not exist.")) from err

    if not episode.video_file:
        raise ApiProcessError(404, _("Video file not found for this episode."))

    return get_video_streaming_response(request, episode.video_file)

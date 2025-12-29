from uuid import UUID

from django.utils.translation import gettext_lazy as _
from ninja import Router

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title
from dkmovie.titles.services.streaming import get_video_streaming_response

router = Router()


@router.get("/title/{title_id}")
def stream_title(request, title_id: UUID):
    if request.user.is_anonymous:
        raise ApiProcessError(401, _("Unauthorized"))

    try:
        title = Title.objects.prefetch_related("videos").get(
            id=title_id,
            status=Title.Status.RELEASED,
        )
    except Title.DoesNotExist as err:
        raise ApiProcessError(404, _("The title does not exist.")) from err

    if title.content_type != Title.ContentType.MOVIE:
        raise ApiProcessError(400, _("This title is not a movie."))

    if not title.is_video_available:
        raise ApiProcessError(404, _("Video file not found for this title."))

    thirty_minutes = 60 * 30
    return get_video_streaming_response(
        request,
        title.video.source_file,
        title.video.duration + thirty_minutes,
    )


@router.get("/episode/{episode_id}")
def stream_episode(request, episode_id: UUID):
    if request.user.is_anonymous:
        raise ApiProcessError(401, _("Unauthorized"))

    try:
        episode = Episode.objects.prefetch_related("videos").get(id=episode_id)
    except Episode.DoesNotExist as err:
        raise ApiProcessError(404, _("The episode does not exist.")) from err

    if not episode.is_video_available:
        raise ApiProcessError(404, _("Video file not found for this episode."))

    thirty_minutes = 60 * 30
    return get_video_streaming_response(
        request,
        episode.video.source_file,
        episode.video.duration + thirty_minutes,
    )

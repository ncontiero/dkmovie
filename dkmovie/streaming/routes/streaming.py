from uuid import UUID

from django.utils.translation import gettext_lazy as _
from ninja import Router

from config.api.utils import ApiProcessError
from dkmovie.streaming.services import get_hls_streaming_response
from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title
from dkmovie.titles.services.concurrency import is_session_valid

router = Router()


@router.get("/title/{title_id}.m3u8")
def stream_title(request, title_id: UUID, session_id: str, path: str | None = None):
    if not is_session_valid(request.user.id, session_id):
        raise ApiProcessError(
            403,
            _("The limit for simultaneous screens has been reached."),
        )

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
        raise ApiProcessError(404, _("This title is not available for streaming."))

    return get_hls_streaming_response(request, title.video, subpath=path)


@router.get("/episode/{episode_id}.m3u8")
def stream_episode(request, episode_id: UUID, session_id: str, path: str | None = None):
    if not is_session_valid(request.user.id, session_id):
        raise ApiProcessError(
            403,
            _("The limit for simultaneous screens has been reached."),
        )

    try:
        episode = Episode.objects.prefetch_related("videos").get(id=episode_id)
    except Episode.DoesNotExist as err:
        raise ApiProcessError(404, _("The episode does not exist.")) from err

    if not episode.is_video_available:
        raise ApiProcessError(404, _("This episode is not available for streaming."))

    return get_hls_streaming_response(request, episode.video, subpath=path)

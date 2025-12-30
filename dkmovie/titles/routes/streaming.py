from uuid import UUID

from django.utils.translation import gettext_lazy as _
from ninja import Router
from ninja import Schema
from ninja.security import SessionAuth

from config.api.utils import ApiProcessError
from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title
from dkmovie.titles.services.concurrency import is_session_valid
from dkmovie.titles.services.concurrency import register_heartbeat
from dkmovie.titles.services.concurrency import release_session
from dkmovie.titles.services.streaming import get_video_streaming_response

router = Router(auth=SessionAuth())


@router.get("/title/{title_id}")
def stream_title(request, title_id: UUID, session_id: str):
    if not is_session_valid(request.user.id, session_id):
        raise ApiProcessError(
            403,
            _("Concurrent stream limit reached or session invalid."),
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
        raise ApiProcessError(404, _("Video file not found for this title."))

    thirty_minutes = 60 * 30
    return get_video_streaming_response(
        request,
        title.video.source_file,
        title.video.duration + thirty_minutes,
    )


@router.get("/episode/{episode_id}")
def stream_episode(request, episode_id: UUID, session_id: str):
    if not is_session_valid(request.user.id, session_id):
        raise ApiProcessError(
            403,
            _("Concurrent stream limit reached or session invalid."),
        )

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


class HeartbeatSchema(Schema):
    session_id: str


class HeartbeatResponse(Schema):
    allowed: bool


@router.post("/heartbeat", response={200: HeartbeatResponse})
def heartbeat(request, payload: HeartbeatSchema):
    allowed = register_heartbeat(request.user.id, payload.session_id)
    return HeartbeatResponse(allowed=allowed)


@router.post("/release", response={204: None})
def release(request, payload: HeartbeatSchema):
    release_session(request.user.id, payload.session_id)
    return 204, None

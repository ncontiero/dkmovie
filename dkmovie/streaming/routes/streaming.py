from uuid import UUID

from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.views.decorators.cache import cache_page
from ninja import Router
from ninja import Schema
from ninja.decorators import decorate_view

from config.api.utils import ApiProcessError
from dkmovie.streaming.services.concurrency import is_session_valid
from dkmovie.streaming.services.concurrency import register_heartbeat
from dkmovie.streaming.services.streaming import get_hls_streaming_response
from dkmovie.titles.models import Episode
from dkmovie.titles.models import Title
from dkmovie.titles.schemas import EpisodeSchema
from dkmovie.titles.schemas import SeasonSchema
from dkmovie.titles.schemas import TitleSchema
from dkmovie.videos.schemas import VideoMarkerSchema
from dkmovie.videos.schemas import VideoSpriteSchema
from dkmovie.videos.schemas import VideoTrackSchema

router = Router()


class DataToStreamSchema(Schema):
    title: TitleSchema
    season: SeasonSchema | None = None
    episode: EpisodeSchema | None = None
    next_episode: EpisodeSchema | None = None
    tracks: list[VideoTrackSchema] = []
    sprites: list[VideoSpriteSchema] = []
    markers: list[VideoMarkerSchema] = []
    session_id: UUID
    stream_manifest_url: str


@router.get("/data_to_stream/{title_id}", response={200: DataToStreamSchema})
@decorate_view(cache_page(3600))
def get_data_to_stream(
    request,
    title_id: UUID,
    session_id: UUID,
    episode_id: UUID | None = None,
):
    allowed = register_heartbeat(request.user.id, session_id)
    if not allowed:
        raise ApiProcessError(
            403,
            _("The limit for simultaneous screens has been reached."),
        )

    try:
        title = Title.objects.prefetch_related(
            "videos__tracks",
            "videos__sprites",
            "videos__markers",
            "seasons__episodes",
        ).get(id=title_id, status=Title.Status.RELEASED)
    except Title.DoesNotExist as e:
        raise ApiProcessError(404, _("The title does not exist.")) from e

    if title.content_type == Title.ContentType.MOVIE:
        if not title.is_video_available:
            raise ApiProcessError(404, _("This title is not available for streaming."))

        video = title.video
        return DataToStreamSchema(
            title=title,
            tracks=video.get_tracks() if video else [],
            sprites=video.get_sprites() if video else [],
            markers=video.get_markers() if video else [],
            session_id=session_id,
            stream_manifest_url=reverse(
                "api-1.0.0:stream_title",
                args=[title_id],
                query={"session_id": session_id},
            ),
        )

    if not episode_id:
        raise ApiProcessError(400, _("Episode ID is required for series titles."))

    season = title.seasons.filter(episodes__id=episode_id).first()
    if not season:
        raise ApiProcessError(404, _("The episode does not exist."))

    try:
        episode: Episode = season.episodes.get(id=episode_id)
    except Episode.DoesNotExist as e:
        raise ApiProcessError(404, _("The episode does not exist.")) from e

    if not episode.is_video_available:
        raise ApiProcessError(404, _("This episode is not available for streaming."))

    video = episode.video
    return DataToStreamSchema(
        title=title,
        season=season,
        episode=episode,
        next_episode=episode.get_next_episode(),
        tracks=video.get_tracks() if video else [],
        sprites=video.get_sprites() if video else [],
        markers=video.get_markers() if video else [],
        session_id=session_id,
        stream_manifest_url=reverse(
            "api-1.0.0:stream_episode",
            args=[episode_id],
            query={"session_id": session_id},
        ),
    )


@router.get("/title/{title_id}.m3u8", url_name="stream_title")
def stream_title(request, title_id: UUID, session_id: UUID, path: str | None = None):
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


@router.get("/episode/{episode_id}.m3u8", url_name="stream_episode")
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

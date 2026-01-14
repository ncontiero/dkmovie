import logging
from pathlib import Path

import requests
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

from config.api.utils import ApiProcessError
from dkmovie.utils.urls import normalize_local_s3_url
from dkmovie.videos.models import Video

logger = logging.getLogger(__name__)


def _fetch_internal_m3u8(s3_client, bucket_name: str, key: str) -> str:
    presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": key},
        ExpiresIn=300,
    )

    try:
        r = requests.get(presigned_url, timeout=5)
        r.raise_for_status()
    except Exception as e:
        logger.exception("Failed to fetch m3u8", exc_info=e)
        raise ApiProcessError(
            404,
            _("Playlist file not found."),
        ) from e
    else:
        return r.text


def _rewrite_playlist_content(
    s3_client,
    content: str,
    target_key: str,
    bucket_name: str,
    session_id: str,
) -> str:
    new_lines = []
    current_dir = str(Path(target_key).parent)

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            new_lines.append(line)
            continue

        if line.endswith(".m3u8"):
            new_url = f"?session_id={session_id}&path={line}"
            new_lines.append(new_url)
        elif line.endswith(".ts"):
            segment_key = f"{current_dir}/{line}"
            segment_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": segment_key},
                ExpiresIn=3600,
            )
            new_lines.append(normalize_local_s3_url(segment_url))
        else:
            new_lines.append(line)
    return "\n".join(new_lines)


def _inject_tracks_into_master(content, video_obj, s3_client, session_id):
    lines = content.splitlines()
    header_lines = []
    body_lines = []

    for line in lines:
        if line.startswith(
            ("#EXTM3U", "#EXT-X-VERSION", "#EXT-X-INDEPENDENT-SEGMENTS"),
        ):
            header_lines.append(line)
        else:
            body_lines.append(line)

    new_lines = header_lines[:]
    audio_group_id = "audio"

    # 1. Inject EXT-X-MEDIA for Audio
    has_audio_tracks = False
    for track in video_obj.tracks.filter(audio_playlist__isnull=False):
        has_audio_tracks = True
        # Virtual path to proxy audio playlist
        track_url = f"?session_id={session_id}&track_audio={track.id}"

        # Attributes
        attrs = [
            "TYPE=AUDIO",
            f'GROUP-ID="{audio_group_id}"',
            f'LANGUAGE="{track.language}"',
            f'NAME="{track.label}"',
            f'URI="{track_url}"',
        ]
        if track.is_original:
            attrs.append("DEFAULT=YES")
        attrs.append("AUTOSELECT=YES")
        new_lines.append(f"#EXT-X-MEDIA:{','.join(attrs)}")

    # 2. Process existing lines (Video Variants)
    for line in body_lines:
        raw_line = line
        if raw_line.startswith("#EXT-X-STREAM-INF"):
            if has_audio_tracks:
                raw_line += f',AUDIO="{audio_group_id}"'
            new_lines.append(raw_line)
        elif raw_line.strip().endswith(".m3u8"):
            new_url = f"?session_id={session_id}&path={raw_line.strip()}"
            new_lines.append(new_url)
        else:
            new_lines.append(raw_line)

    return "\n".join(new_lines)


def get_hls_streaming_response(request, video_obj: Video, subpath: str | None = None):
    hls_playlist = video_obj.hls_playlist

    if not hls_playlist or video_obj.status != "COMPLETED":
        raise ApiProcessError(404, _("Video not found or not ready for streaming."))

    storage = hls_playlist.storage
    bucket_name = storage.bucket_name
    client = storage.connection.meta.client
    session_id = request.GET.get("session_id", "")

    # Handle Audio Track Proxy
    track_audio_id = request.GET.get("track_audio")
    if track_audio_id:
        try:
            track = video_obj.tracks.get(id=track_audio_id)
            if not track.audio_playlist:
                raise ApiProcessError(404, _("Audio track not ready."))  # noqa: TRY301

            # Fetch audio playlist
            target_key = track.audio_playlist.name
            track_bucket = track.audio_playlist.storage.bucket_name
            content = _fetch_internal_m3u8(client, track_bucket, target_key)

            # Rewrite segments (they are relative to audio playlist)
            rewritten = _rewrite_playlist_content(
                client,
                content,
                target_key,
                track_bucket,
                session_id,
            )
            return HttpResponse(
                rewritten,
                content_type="application/vnd.apple.mpegurl",
            )

        except Exception as e:
            logger.exception("Failed to fetch audio track", exc_info=e)
            raise ApiProcessError(404, _("Track not found.")) from e

    # Handle Main Video (Master or Variant)
    master_key = hls_playlist.name
    base_dir = Path(master_key).parent

    if subpath:
        try:
            subpath_path = Path(subpath)
            if subpath_path.is_absolute():
                msg = "Absolute paths are not allowed"
                raise ValueError(msg)  # noqa: TRY301
            candidate_path = base_dir / subpath_path
            candidate_path.relative_to(base_dir)
        except Exception as e:
            raise ApiProcessError(400, _("Invalid path.")) from e

        if candidate_path.suffix != ".m3u8":
            raise ApiProcessError(400, _("Invalid path."))
        target_key = str(candidate_path)
    else:
        target_key = master_key

    content = _fetch_internal_m3u8(client, bucket_name, target_key)

    rewritten_content = _rewrite_playlist_content(
        client,
        content,
        target_key,
        bucket_name,
        session_id,
    )

    if not subpath:
        rewritten_content = _inject_tracks_into_master(
            rewritten_content,
            video_obj,
            client,
            session_id,
        )

    return HttpResponse(
        rewritten_content,
        content_type="application/vnd.apple.mpegurl",
    )

import json
import logging
import os
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from django.core.files import File
from django.utils.translation import gettext_lazy as _

from dkmovie.utils.urls import normalize_local_s3_url_to_service
from dkmovie.videos.models import Video
from dkmovie.videos.models import VideoTrack
from dkmovie.videos.models import audio_playlist_file_path
from dkmovie.videos.utils import get_threads_count

logger = logging.getLogger(__name__)


def get_video_tracks_metadata(video_url: str):
    command = [
        "ffprobe",
        "-hide_banner",
        "-v",
        "error",
        "-show_entries",
        "stream=index,codec_type:stream_tags=language,title",
        "-of",
        "json",
        normalize_local_s3_url_to_service(video_url),
    ]

    try:
        res = subprocess.run(  # noqa: S603
            command,
            capture_output=True,
            text=True,
            check=True,
        )
        data = json.loads(res.stdout)

        streams = data.get("streams", [])
        audio_streams = []
        subtitle_streams = []

        for s in streams:
            idx = s["index"]
            codec = s["codec_type"]
            tags = s.get("tags", {})
            lang = tags.get("language", "und")
            title = tags.get("title", _("Track %s") % idx)

            track_info = {
                "index": idx,
                "language": lang,
                "label": title,
            }

            if codec == "audio":
                audio_streams.append(track_info)
            elif codec == "subtitle":
                subtitle_streams.append(track_info)
    except Exception as e:
        logger.exception("Error parsing FFprobe output", exc_info=e)
        return None
    else:
        return {"audio": audio_streams, "subtitle": subtitle_streams}


def extract_audio_track(video: Video, track_instance: VideoTrack, temp_dir: Path):
    audio_index = track_instance.source_audio_index
    if not audio_index:
        logger.warning(
            "Audio track instance %s has no source_audio_index.",
            track_instance.id,
        )
        return

    input_url = normalize_local_s3_url_to_service(video.source_file.url)
    output_dir = temp_dir / "audio" / str(track_instance.id) / str(audio_index)
    output_dir.mkdir(parents=True, exist_ok=True)

    playlist_path = output_dir / "audio.m3u8"

    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-threads",
        str(get_threads_count()),
        "-y",
        "-i",
        input_url,
        "-map",
        f"0:{audio_index}",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ac",
        "2",
        "-f",
        "hls",
        "-hls_time",
        "6",
        "-hls_playlist_type",
        "vod",
        "-hls_flags",
        "independent_segments",
        "-hls_segment_filename",
        str(output_dir / "seg_%03d.ts"),
        str(playlist_path),
    ]

    try:
        subprocess.run(cmd, check=True)  # noqa: S603
    except subprocess.CalledProcessError as e:
        logger.exception("FFmpeg audio extraction failed", exc_info=e)
        return

    # Upload logic for audio playlist
    storage = track_instance.audio_playlist.storage
    bucket_name = storage.bucket_name
    s3_client = storage.connection.meta.client

    relative_path = audio_playlist_file_path(track_instance, "audio.m3u8")
    s3_base_dir = str(Path(relative_path).parent)

    files_to_upload = []
    for root, __, files in os.walk(output_dir):
        for file in files:
            local_path = Path(root) / file
            s3_key = f"{s3_base_dir}/{file}"
            content_type = (
                "application/vnd.apple.mpegurl"
                if file.endswith(".m3u8")
                else "video/MP2T"
            )
            files_to_upload.append(
                (str(local_path), bucket_name, s3_key, content_type),
            )

    def upload_single_file(args):
        local, bucket, key, c_type = args
        s3_client.upload_file(local, bucket, key, ExtraArgs={"ContentType": c_type})

    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(upload_single_file, files_to_upload)

    track_instance.audio_playlist.name = relative_path
    track_instance.save(update_fields=["audio_playlist"])
    shutil.rmtree(temp_dir, ignore_errors=True)


def extract_subtitle_track(video: Video, track_instance: VideoTrack, temp_dir: Path):
    subtitle_index = track_instance.source_subtitle_index
    if not subtitle_index:
        logger.warning(
            "Subtitle track instance %s has no source_subtitle_index.",
            track_instance.id,
        )
        return

    input_url = normalize_local_s3_url_to_service(video.source_file.url)
    output_dir = temp_dir / "subtitles" / str(track_instance.id) / str(subtitle_index)
    output_dir.mkdir(parents=True, exist_ok=True)

    subtitle_path = output_dir / "subtitles.vtt"

    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-threads",
        str(get_threads_count()),
        "-y",
        "-i",
        input_url,
        "-map",
        f"0:{subtitle_index}",
        "-f",
        "webvtt",
        str(subtitle_path),
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)  # noqa: S603
    except subprocess.CalledProcessError as e:
        logger.exception(
            "FFmpeg subtitle extraction failed. Stderr: %s",
            e.stderr,
            exc_info=e,
        )
        return

    # Upload logic for subtitle
    with Path.open(subtitle_path, "rb") as f:
        track_instance.subtitle_file.save(subtitle_path.name, File(f), save=True)

    shutil.rmtree(temp_dir, ignore_errors=True)

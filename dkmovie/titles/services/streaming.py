import logging
from pathlib import Path

import boto3
import requests
from botocore.config import Config
from django.conf import settings
from django.http import HttpResponse
from django.utils.translation import gettext_lazy as _

from config.api.utils import ApiProcessError

logger = logging.getLogger(__name__)

SIGNING_ENDPOINT = getattr(
    settings,
    "AWS_S3_PUBLIC_ENDPOINT_URL",
    settings.AWS_S3_ENDPOINT_URL,
)


def get_s3_client(endpoint=SIGNING_ENDPOINT):
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=Config(signature_version="s3v4"),
    )


def get_hls_streaming_response(request, video_obj, subpath=None):
    if not video_obj.hls_playlist or video_obj.status != "COMPLETED":
        raise ApiProcessError(404, _("Video not found or not ready for streaming."))

    storage_backend = video_obj.hls_playlist.storage
    bucket_name = storage_backend.bucket_name

    # Determine which file to serve (Master or Variant)
    master_key = video_obj.hls_playlist.name
    base_dir = Path(master_key).parent

    if subpath:
        # Normalize and validate subpath against base_dir
        # to prevent directory traversal attacks
        try:
            subpath_path = Path(subpath)
            # Reject absolute paths outright
            if subpath_path.is_absolute():
                msg = "Absolute paths are not allowed"
                raise ValueError(msg)  # noqa: TRY301
            candidate_path = base_dir / subpath_path
            candidate_path.relative_to(base_dir)
        except Exception as e:
            raise ApiProcessError(400, _("Invalid path.")) from e

        # Enforce .m3u8 extension on the final, normalized path
        if candidate_path.suffix != ".m3u8":
            raise ApiProcessError(400, _("Invalid path."))
        target_key = str(candidate_path)
    else:
        target_key = master_key

    # Fetch content using internal client
    internal_client = get_s3_client(endpoint=settings.AWS_S3_ENDPOINT_URL)

    presigned_url = internal_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": target_key},
        ExpiresIn=300,
    )

    try:
        r = requests.get(presigned_url, timeout=5)
        r.raise_for_status()
        content = r.text
    except Exception as e:
        logger.exception("Failed to fetch m3u8", exc_info=e)
        raise ApiProcessError(
            404,
            _("Playlist file not found."),
        ) from e

    # Rewrite content
    new_lines = []
    signing_client = get_s3_client()
    # The directory of the current playlist file
    current_dir = str(Path(target_key).parent)
    session_id = request.GET.get("session_id", "")

    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            new_lines.append(line)
            continue

        if line.endswith(".m3u8"):
            # Variant Playlist -> Rewrite to point back to our API
            # We append the variant path to the current API call logic
            # Assuming line is relative path like "v0/prog.m3u8"
            new_url = f"?session_id={session_id}&path={line}"
            new_lines.append(new_url)

        elif line.endswith(".ts"):
            # Segment -> Sign direct S3 URL
            # Segment is relative to current_dir
            segment_key = f"{current_dir}/{line}"
            segment_url = signing_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": segment_key},
                ExpiresIn=3600,
            )
            new_lines.append(segment_url)
        else:
            # Unknown line type, keep as is
            new_lines.append(line)

    return HttpResponse(
        "\n".join(new_lines),
        content_type="application/vnd.apple.mpegurl",
    )

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


def get_hls_streaming_response(request, video_obj):
    if not video_obj.hls_playlist or video_obj.status != "COMPLETED":
        raise ApiProcessError(404, _("Video not found or not ready for streaming."))

    storage_backend = video_obj.hls_playlist.storage

    # Internal client to fetch the playlist content locally
    internal_client = get_s3_client(endpoint=settings.AWS_S3_ENDPOINT_URL)

    m3u8_url = internal_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": storage_backend.bucket_name,
            "Key": video_obj.hls_playlist.name,
        },
        ExpiresIn=300,
    )

    try:
        r = requests.get(m3u8_url, timeout=5)
        r.raise_for_status()
        content = r.text
    except Exception as e:
        logger.exception("Failed to fetch m3u8", exc_info=e)
        # Fallback to source file
        raise ApiProcessError(
            404,
            _("Video not found or not ready for streaming."),
        ) from e

    base_path = str(Path(video_obj.hls_playlist.name).parent)
    new_lines = []

    # External client to sign segment URLs for the user
    signing_client = get_s3_client()

    for line in content.splitlines():
        if line.strip().endswith(".ts"):
            segment_key = f"{base_path}/{line.strip()}"
            segment_url = signing_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": storage_backend.bucket_name,
                    "Key": segment_key,
                },
                ExpiresIn=3600,
            )
            new_lines.append(segment_url)
        else:
            new_lines.append(line)

    return HttpResponse(
        "\n".join(new_lines),
        content_type="application/vnd.apple.mpegurl",
    )

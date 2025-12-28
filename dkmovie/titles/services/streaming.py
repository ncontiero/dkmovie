import logging

from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils.translation import gettext_lazy as _

from config.api.utils import ApiProcessError

logger = logging.getLogger(__name__)

SIGNING_ENDPOINT = getattr(
    settings,
    "AWS_S3_PUBLIC_ENDPOINT_URL",
    settings.AWS_S3_ENDPOINT_URL,
)


def get_s3_client():
    import boto3  # noqa: PLC0415
    from botocore.config import Config  # noqa: PLC0415

    return boto3.client(
        "s3",
        endpoint_url=SIGNING_ENDPOINT,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=Config(signature_version="s3v4"),
    )


def get_video_streaming_response(request, file_field, expiration_seconds=3600):
    """
    Generates a response for video streaming.
    """
    if not file_field:
        return None

    try:
        # Try to generate a presigned URL with expiration
        storage_backend = file_field.storage
        client = storage_backend.connection.meta.client

        # If AWS_S3_PUBLIC_ENDPOINT_URL is set (e.g. localhost for docker), use it.
        # Otherwise fall back to the standard endpoint.
        if SIGNING_ENDPOINT != settings.AWS_S3_ENDPOINT_URL:
            client = get_s3_client()

        url = client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": storage_backend.bucket_name,
                "Key": file_field.name,
            },
            ExpiresIn=expiration_seconds,
        )

        return HttpResponseRedirect(url)
    except Exception as e:
        logger.exception(
            "Error accessing file_field.url for remote storage",
            exc_info=e,
        )
        raise ApiProcessError(
            400,
            _("Failed to generate presigned URL for streaming."),
        ) from e

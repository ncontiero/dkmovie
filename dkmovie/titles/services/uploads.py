import uuid
from mimetypes import guess_extension

from django.conf import settings
from django.core.files.storage import default_storage


def generate_upload_url(file_name: str, content_type: str):
    """
    Generates a presigned PUT URL for direct S3 upload.
    Returns the URL and the future key (path) of the file.
    """
    # Ensure unique path
    ext = guess_extension(content_type) or ""
    if not file_name.endswith(ext):
        file_name += ext

    file_path = f"uploads/{uuid.uuid4()}/{file_name}"
    key_path = f"media/{file_path}"

    # Access the underlying boto3 client
    # This works when using S3Boto3Storage
    if not hasattr(default_storage, "connection"):
        msg = "Storage backend does not support S3 connection"
        raise NotImplementedError(msg)

    client = default_storage.connection.meta.client
    bucket_name = default_storage.bucket_name

    # Generate URL
    url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": bucket_name,
            "Key": key_path,
            "ContentType": content_type,
        },
        ExpiresIn=3600,  # 1 hour
    )

    # Local Docker Fix:
    # The browser cannot resolve 'minio:9000' (internal docker network).
    # We replace it with 'localhost:9000' so the browser can reach MinIO.

    if settings.DEBUG and "minio:9000" in url:
        url = url.replace("minio:9000", "localhost:9000")

    return {
        "url": url,
        "method": "PUT",
        "key": file_path,
        "headers": {
            "Content-Type": content_type,
        },
    }

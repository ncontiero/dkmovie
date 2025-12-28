from botocore.config import Config
from django.conf import settings
from storages.backends.s3 import S3Storage

PUBLIC_BUCKET_NAME = settings.AWS_PUBLIC_STORAGE_BUCKET_NAME
PRIVATE_BUCKET_NAME = settings.AWS_PRIVATE_STORAGE_BUCKET_NAME
PUBLIC_CUSTOM_DOMAIN = settings.AWS_S3_PUBLIC_CUSTOM_DOMAIN


class StaticStorage(S3Storage):
    location = "static"
    default_acl = "public-read"
    file_overwrite = True
    querystring_auth = False
    bucket_name = PUBLIC_BUCKET_NAME
    custom_domain = PUBLIC_CUSTOM_DOMAIN


class PublicMediaStorage(StaticStorage):
    location = ""
    file_overwrite = False


class PrivateMediaStorage(S3Storage):
    location = ""
    default_acl = "private"
    file_overwrite = False
    querystring_auth = True
    bucket_name = PRIVATE_BUCKET_NAME
    config = Config(signature_version="s3" if settings.DEBUG else "s3v4")

    # --- DOCKER NETWORK FIX ---
    # When running inside Docker, 'localhost' refers to the container itself.
    # If the URL points to localhost:9000 (MinIO), we must change it to the
    # container hostname ('minio').
    def url(self, name, parameters=None, expire=None, http_method=None):
        url = super().url(name, parameters, expire, http_method)
        if settings.DEBUG and "minio:9000" in url:
            url = url.replace("minio:9000", "localhost:9000")
        return url

from botocore.config import Config
from django.conf import settings
from storages.backends.s3 import S3Storage

PUBLIC_BUCKET_NAME = settings.AWS_PUBLIC_STORAGE_BUCKET_NAME
PRIVATE_BUCKET_NAME = settings.AWS_PRIVATE_STORAGE_BUCKET_NAME
PUBLIC_CUSTOM_DOMAIN = settings.AWS_S3_PUBLIC_CUSTOM_DOMAIN
PRIVATE_CUSTOM_DOMAIN = settings.AWS_S3_PRIVATE_CUSTOM_DOMAIN


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
    custom_domain = PRIVATE_CUSTOM_DOMAIN
    config = Config(signature_version="s3" if settings.DEBUG else "s3v4")

from django.conf import settings


def normalize_local_s3_url(url: str) -> str:
    if settings.DEBUG and "minio:9000" in url:
        url = url.replace("minio:9000", "localhost:9000")
    return url


def normalize_local_s3_url_to_service(url: str) -> str:
    if settings.DEBUG and "localhost:9000" in url:
        url = url.replace("localhost:9000", "minio:9000")
    return url

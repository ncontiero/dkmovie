import logging
from typing import Any

import requests
from django.conf import settings
from django.core.files.base import ContentFile

from .models import Title

TMDB_API_KEY = settings.TMDB_API_KEY
API_BASE_URL = settings.TMDB_API_URL
IMAGE_BASE_URL = settings.TMDB_IMAGE_BASE_URL
DEFAULT_LANGUAGE = settings.LANGUAGE_CODE
LANGUAGES = settings.LANGUAGES

OK_CODE = 200


logger = logging.getLogger(__name__)


class TMDBClient:
    def __init__(self):
        self.headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {TMDB_API_KEY}",
        }

    def fetch(self, endpoint: str, params: dict[str, Any]) -> dict | None:
        """Generic fetcher with error handling."""
        url = f"{API_BASE_URL}{endpoint}"
        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=30,
            )
            if response.status_code == OK_CODE:
                return response.json()

            logger.warning(
                "TMDB request failed. Status: %s, URL: %s",
                response.status_code,
                url,
            )
        except requests.RequestException as e:
            logger.exception(
                "Network error connecting to TMDB endpoint %s",
                endpoint,
                exc_info=e,
            )
        return None

    def download_image(self, path: str | None) -> ContentFile | None:
        """Downloads image from TMDB and returns ContentFile."""
        if not path:
            return None
        try:
            url = f"{IMAGE_BASE_URL}{path}"
            response = requests.get(url, timeout=10)
            if response.status_code == OK_CODE:
                return ContentFile(response.content, name=path.lstrip("/"))
        except Exception as e:
            logger.exception("Error downloading image %s", path, exc_info=e)
        return None

    def get_details(
        self,
        tmdb_id: int,
        content_type: str,
        params: dict | None = None,
    ) -> dict | None:
        path_type = "movie" if content_type == Title.ContentType.MOVIE else "tv"
        return self.fetch(f"/{path_type}/{tmdb_id}", params or {})

    def discover(self, content_type: str, params: dict) -> list[dict]:
        path_type = "movie" if content_type == Title.ContentType.MOVIE else "tv"
        data = self.fetch(f"/discover/{path_type}", params)
        return data.get("results", []) if data else []

    def get_season_details(
        self,
        tmdb_id: int,
        season_number: int,
        params: dict | None = None,
    ) -> dict | None:
        return self.fetch(f"/tv/{tmdb_id}/season/{season_number}", params or {})

    def get_episode_details(
        self,
        tmdb_id: int,
        season_number: int,
        episode_number: int,
        params: dict | None = None,
    ) -> dict | None:
        return self.fetch(
            f"/tv/{tmdb_id}/season/{season_number}/episode/{episode_number}",
            params or {},
        )


def normalize_local_s3_url(url: str) -> str:
    if settings.DEBUG and "minio:9000" in url:
        url = url.replace("minio:9000", "localhost:9000")
    return url


def normalize_local_s3_url_to_service(url: str) -> str:
    if settings.DEBUG and "localhost:9000" in url:
        url = url.replace("localhost:9000", "minio:9000")
    return url

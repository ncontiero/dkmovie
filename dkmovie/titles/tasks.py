import logging
from datetime import timedelta

import requests
from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.urls import reverse
from django.utils import timezone

from dkmovie.users.utils import send_email
from dkmovie.utils.tasks import default_task_params

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title

logger = logging.getLogger(__name__)


TMDB_API_KEY = settings.TMDB_API_KEY
API_BASE_URL = settings.TMDB_API_URL
IMAGE_BASE_URL = settings.TMDB_IMAGE_BASE_URL
OK_CODE = 200

DEFAULT_LANGUAGE = settings.LANGUAGE_CODE
LANGUAGES = settings.LANGUAGES

# Crawler Settings
MAX_PAGES = 3  # Maximum number of pages to process per task execution
SEARCH_WINDOW_DAYS = 90
INITIAL_BUFFER_DAYS = 7
MIN_VOTE_AVERAGE = 1
MIN_RUNTIME_MINUTES = 40

tmdb_default_headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_API_KEY}",
}


def get_model_lang_suffix(lang_code: str) -> str:
    """Converts 'pt-br' to 'pt_br'."""
    return lang_code.replace("-", "_").lower()


def fetch_tmdb_data(endpoint: str, params: dict) -> dict | None:
    """Generic TMDB fetcher with error handling."""
    url = f"{API_BASE_URL}{endpoint}"
    try:
        response = requests.get(
            url,
            headers=tmdb_default_headers,
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


def download_image(path: str) -> ContentFile | None:
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


def get_trailer_url(videos: list[dict]) -> str:
    """Finds the YouTube trailer URL from the video list."""
    for video in videos:
        if video.get("site") == "YouTube" and video.get("type") == "Trailer":
            return f"https://www.youtube.com/watch?v={video.get('key')}"
    return ""


def get_cast_list(cast: list[dict]) -> str:
    """Returns a comma-separated string of the top 5 cast members."""
    return ", ".join([m["name"] for m in cast[:5]])


def process_title_images(title: Title, details: dict) -> None:
    """Downloads and saves poster/cover images for the title."""
    poster = download_image(details.get("poster_path"))
    cover = download_image(details.get("backdrop_path"))

    if poster:
        title.poster.save(poster.name, poster, save=False)
    if cover:
        title.cover.save(cover.name, cover, save=False)


@shared_task(
    **default_task_params(
        "populate_episodes_from_tmdb",
        soft_time_limit=300,
        time_limit=300,
    ),
)
def populate_episodes_from_tmdb(self, season_id: str):
    season = Season.objects.prefetch_related("title").get(id=season_id)
    title_tmdb_id = season.title.tmdb_id

    if not title_tmdb_id:
        return

    for lang_code, _ in LANGUAGES:
        is_main = lang_code == DEFAULT_LANGUAGE
        lang_suffix = get_model_lang_suffix(lang_code)

        params = {"language": lang_code}
        seasons_details = fetch_tmdb_data(
            f"/tv/{title_tmdb_id}/season/{season.number}",
            params,
        )
        if not seasons_details:
            continue

        episodes = seasons_details.get("episodes", [])
        if not episodes:
            continue

        for episode_data in episodes:
            episode, _ = Episode.objects.populate(True).get_or_create(  # noqa: FBT003
                tmdb_id=episode_data.get("id"),
                defaults={
                    "tmdb_id": episode_data.get("id"),
                    "season": season,
                    "number": episode_data.get("episode_number", 1),
                    "name": episode_data.get("name", ""),
                    "overview": episode_data.get("overview", ""),
                    "air_date": episode_data.get("air_date"),
                    "duration": episode_data.get("runtime", 0),
                    "rating": episode_data.get("vote_average", 0),
                },
            )

            if is_main:
                still = download_image(episode_data.get("still_path"))
                if still:
                    episode.still.save(still.name, still, save=False)
                    episode.save(update_fields=["still"])
            else:
                name_field = f"name_{lang_suffix}"
                overview_field = f"overview_{lang_suffix}"
                setattr(episode, name_field, episode_data.get("name", ""))
                setattr(episode, overview_field, episode_data.get("overview", ""))
                episode.save(update_fields=[name_field, overview_field])


@shared_task(
    **default_task_params(
        "populate_seasons_from_tmdb",
        soft_time_limit=300,
        time_limit=300,
    ),
)
def populate_seasons_from_tmdb(
    self,
    title_id: str,
    title_tmdb_id: int,
    seasons_details: list[dict],
):
    title = Title.objects.get(id=title_id)

    for season_data in seasons_details:
        for lang_code, _ in LANGUAGES:
            is_main = lang_code == DEFAULT_LANGUAGE
            lang_suffix = get_model_lang_suffix(lang_code)

            params = {"language": lang_code}
            details = fetch_tmdb_data(
                f"/tv/{title_tmdb_id}/season/{season_data['number']}",
                params,
            )
            if not details:
                continue

            episodes = details.get("episodes", [])
            if not episodes:
                continue

            season, _ = Season.objects.populate(True).get_or_create(  # noqa: FBT003
                tmdb_id=details.get("id"),
                defaults={
                    "tmdb_id": details.get("id"),
                    "title": title,
                    "number": details.get("season_number", 1),
                    "name": details.get("name", ""),
                    "overview": details.get("overview", ""),
                    "air_date": details.get("air_date"),
                    "rating": details.get("vote_average", 0),
                },
            )

            if is_main:
                process_title_images(season, details)
                season.save(update_fields=["poster"])
            else:
                name_field = f"name_{lang_suffix}"
                overview_field = f"overview_{lang_suffix}"
                setattr(season, name_field, details.get("name", ""))
                already_have_overview = getattr(season, overview_field, "")
                if not already_have_overview:
                    setattr(season, overview_field, details.get("overview", ""))
                season.save(update_fields=[name_field, overview_field])


def fetch_title_details_and_update(
    title_obj: Title,
    tmdb_id: int,
    title_type: Title.ContentType,
) -> dict[str, list]:
    """
    Fetches details for all languages and populates the Title object in-memory.
    Returns the map of genres to be processed after saving.
    """
    genres_lang_map: dict[str, list[dict]] = {}
    path_type = "movie" if title_type == Title.ContentType.MOVIE else "tv"

    for lang_code, _ in LANGUAGES:
        is_main = lang_code == DEFAULT_LANGUAGE
        lang_suffix = get_model_lang_suffix(lang_code)

        # Only fetch heavier data (videos/credits) for main language
        params = {
            "language": lang_code,
            "append_to_response": "videos,credits" if is_main else "",
        }

        details = fetch_tmdb_data(f"/{path_type}/{tmdb_id}", params)
        if not details:
            continue

        # 1. Store Genres
        genres_lang_map[lang_suffix] = details.get("genres", [])

        # 2. Translations (Title/Description)
        # Handle "title" vs "name" (Movie vs TV)
        api_title = details.get("title") or details.get("name") or ""
        api_orig_title = (
            details.get("original_title") or details.get("original_name") or ""
        )

        if not is_main and api_title != api_orig_title:
            setattr(title_obj, f"title_{lang_suffix}", api_title)

        setattr(title_obj, f"description_{lang_suffix}", details.get("overview", ""))

        # 3. Handle Main Language Specifics (Runtime, Media, Cast)
        if is_main:
            title_obj.title = api_title
            title_obj.description = details.get("overview", "")
            title_obj.rating = details.get("vote_average", 0)
            title_obj.duration = details.get("runtime", 0)

            release = details.get("release_date") or details.get("first_air_date")
            title_obj.release_date = release or None

            videos = details.get("videos", {}).get("results", [])
            cast = details.get("credits", {}).get("cast", [])

            title_obj.trailer_url = get_trailer_url(videos)
            title_obj.cast = get_cast_list(cast)

            process_title_images(title_obj, details)

        if title_type == Title.ContentType.SERIES:
            seasons = details.get("seasons", [])
            seasons_details = [
                {"tmdb_id": s.get("id"), "number": s.get("season_number")}
                for s in seasons
                if s.get("episode_count", 0) > 0
            ]
            populate_seasons_from_tmdb.delay(title_obj.id, tmdb_id, seasons_details)

    return genres_lang_map


def process_genres(title: Title, genres_lang_map: dict[str, list[dict]]) -> None:
    """
    Syncs genres across languages.
    Ensures canonical name is English/Default, adds translations, and links M2M.
    """
    genres_to_add = []
    default_suffix = get_model_lang_suffix(DEFAULT_LANGUAGE)
    default_genres = genres_lang_map.get(default_suffix, [])

    # ID -> Name lookup for the default language (Canonical Source)
    default_genres_lookup = {g["id"]: g["name"] for g in default_genres}

    for lang_suffix, genres_data in genres_lang_map.items():
        is_default = lang_suffix == default_suffix

        for g_data in genres_data:
            g_id = g_data["id"]
            local_name = g_data["name"]

            # Fallback to local name if ID not found in default list
            canonical_name = default_genres_lookup.get(g_id, local_name)

            genre_obj, _ = Genre.objects.get_or_create(
                name=canonical_name,
                defaults={"name": local_name},
            )

            # Update translation ONLY if the field is empty.
            name_field = f"name_{lang_suffix}"
            current_value = getattr(genre_obj, name_field, None)
            if not current_value:
                setattr(genre_obj, name_field, local_name)
                genre_obj.save(update_fields=[name_field])

            # We only add to the M2M list if we are processing the default language
            if is_default:
                genres_to_add.append(genre_obj)

    if genres_to_add:
        title.genres.set(genres_to_add)


def populate_single_title(
    item_data: dict,
    title_type: Title.ContentType,
) -> tuple[bool, Title | None]:
    """
    Orchestrates the creation/update of a single title.
    Returns a tuple (success: bool, title: Title | None).
    """
    tmdb_id = item_data["id"]

    if Title.objects.filter(
        tmdb_id=tmdb_id,
        added_by=Title.AddedBy.TMDB,
        content_type=title_type,
    ).exists():
        logger.info(
            "Title with TMDB ID %s and type %s already exists. Skipping.",
            tmdb_id,
            title_type,
        )
        return False, None

    try:
        item_title = (item_data.get("title") or item_data.get("name")) or ""
        release_date = item_data.get("release_date") or item_data.get("first_air_date")

        new_title, _ = Title.objects.populate(True).get_or_create(  # noqa: FBT003
            tmdb_id=tmdb_id,
            defaults={
                "tmdb_id": tmdb_id,
                "title": item_title,
                "description": item_data.get("overview", ""),
                "content_type": title_type,
                "release_date": release_date or None,
                "rating": item_data.get("vote_average", 0),
                "added_by": Title.AddedBy.TMDB,
            },
        )

        # 1. Fetch details across all languages and fill the object
        genres_map = fetch_title_details_and_update(new_title, tmdb_id, title_type)

        # 2. Save the movie first (needed for M2M relations and ImageFields)
        new_title.save()

        # 3. Process Genres
        process_genres(new_title, genres_map)
    except Exception as e:
        logger.exception(
            "Error processing %s with ID %s",
            title_type,
            tmdb_id,
            exc_info=e,
        )
        return False, None
    else:
        return True, new_title


def get_discovery_date_range(content_type: str) -> tuple[str, str]:
    """
    Calculates the date range for back-filling content.
    Finds the oldest TMDB-added title and searches backwards from there.
    """
    oldest_title = (
        Title.objects.filter(
            content_type=content_type,
            release_date__isnull=False,
            added_by=Title.AddedBy.TMDB,
        )
        .order_by("release_date")
        .first()
    )

    end_date = timezone.now() - timedelta(days=INITIAL_BUFFER_DAYS)
    if oldest_title:
        end_date = oldest_title.release_date

    start_date = end_date - timedelta(days=SEARCH_WINDOW_DAYS)

    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")


def fetch_and_process_discovery_results(
    params: dict,
    title_type: Title.ContentType,
) -> list[Title]:
    """
    Fetches discovery list iterating up to MAX_PAGES and processes each item.
    """

    path_type = "movie" if title_type == Title.ContentType.MOVIE else "tv"
    all_created_titles = []

    for page in range(1, MAX_PAGES + 1):
        params["page"] = page
        data = fetch_tmdb_data(f"/discover/{path_type}", params)
        if not data:
            break

        results = data.get("results", [])
        if not results:
            break

        for item in results:
            success, title = populate_single_title(item, title_type)
            if success and title:
                all_created_titles.append(title)

    return all_created_titles


@shared_task(**default_task_params("send_titles_added_email_task"))
def send_titles_added_email_task(
    self,
    title_data: list[dict],
    title_type: Title.ContentType = Title.ContentType.MOVIE,
) -> None:
    if not title_data or not settings.ADMINS:
        return

    title_links: list[dict] = [
        {
            "title": data["title"] or None,
            "admin_url": reverse("admin:titles_title_change", args=(data["id"],)),
        }
        for data in title_data
    ]

    see_all_url = reverse(
        "admin:titles_title_changelist",
        query={"content_type": title_type, "status": Title.Status.AWAITING_REVIEW},
    )

    if settings.ADMINS:
        _, admin_email = settings.ADMINS[0]
        send_email(
            subject=f"New {title_type.rstrip('S').capitalize()}s Added",
            to=[admin_email],
            template="emails/titles-added.html",
            context={"title_links": title_links, "see_all_url": see_all_url},
        )


@shared_task(**default_task_params("populate_title_admin_task"))
def populate_title_admin_task(self, tmdb_id: int, title_type: str) -> None:
    populate_single_title({"id": tmdb_id}, title_type)


@shared_task(
    **default_task_params(
        "populate_movies_from_tmdb",
        soft_time_limit=300,
        time_limit=300,
    ),
)
def populate_movies_from_tmdb(self):
    """Fetches movies from TMDB and saves them to the database."""

    start_date, end_date = get_discovery_date_range(Title.ContentType.MOVIE)

    params = {
        "language": DEFAULT_LANGUAGE,
        "release_date.gte": start_date,
        "release_date.lte": end_date,
        "sort_by": "primary_release_date.desc",
        "with_release_type": "3",
        "with_runtime.gte": MIN_RUNTIME_MINUTES,
        "vote_average.gte": MIN_VOTE_AVERAGE,
    }

    created_movies = fetch_and_process_discovery_results(
        params,
        Title.ContentType.MOVIE,
    )

    if created_movies:
        title_payload = [{"id": m.id, "title": m.title} for m in created_movies]
        send_titles_added_email_task.delay(title_payload, Title.ContentType.MOVIE)

    return f"{len(created_movies)} movies created."


@shared_task(
    **default_task_params(
        "populate_series_from_tmdb",
        soft_time_limit=300,
        time_limit=300,
    ),
)
def populate_series_from_tmdb(self):
    """Fetches series from TMDB and saves them to the database."""

    start_date, end_date = get_discovery_date_range(Title.ContentType.SERIES)
    params = {
        "language": DEFAULT_LANGUAGE,
        "first_air_date.gte": start_date,
        "first_air_date.lte": end_date,
        "sort_by": "first_air_date.desc",
        "with_release_type": "3",
        "vote_average.gte": MIN_VOTE_AVERAGE,
    }

    created_series = fetch_and_process_discovery_results(
        params,
        Title.ContentType.SERIES,
    )

    if created_series:
        title_payload = [{"id": s.id, "title": s.title} for s in created_series]
        send_titles_added_email_task.delay(title_payload, Title.ContentType.SERIES)

    return f"{len(created_series)} series created."

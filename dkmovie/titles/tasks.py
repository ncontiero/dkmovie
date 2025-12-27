import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.db import transaction
from django.urls import reverse
from django.utils import timezone
from django.utils.dateparse import parse_date

from dkmovie.titles.services.video import get_video_duration
from dkmovie.users.utils import send_email
from dkmovie.utils.tasks import default_task_params

from .models import Episode
from .models import Genre
from .models import Season
from .models import Title
from .models import Video
from .utils import TMDBClient

TMDB_API_KEY = settings.TMDB_API_KEY
API_BASE_URL = settings.TMDB_API_URL
IMAGE_BASE_URL = settings.TMDB_IMAGE_BASE_URL
DEFAULT_LANGUAGE = settings.LANGUAGE_CODE
LANGUAGES = settings.LANGUAGES

OK_CODE = 200

# Crawler Settings
MAX_PAGES = 3
SEARCH_WINDOW_DAYS = 90
INITIAL_BUFFER_DAYS = 7
MIN_VOTE_AVERAGE = 1
MIN_RUNTIME_MINUTES = 40


logger = logging.getLogger(__name__)

tmdb_client = TMDBClient()


def get_model_lang_suffix(lang_code: str) -> str:
    """Converts 'pt-br' to 'pt_br'."""
    return lang_code.replace("-", "_").lower()


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
    poster = tmdb_client.download_image(details.get("poster_path"))
    cover = tmdb_client.download_image(details.get("backdrop_path"))

    if poster:
        title.poster.save(poster.name, poster, save=False)
    if cover:
        title.cover.save(cover.name, cover, save=False)


def process_duration(details: dict, model_obj: Title | Episode) -> None:
    """Processes and saves the duration for a given model_obj (Title or Episode)."""
    duration_minutes = details.get("runtime", 0)
    if not duration_minutes:
        return

    duration_seconds = duration_minutes * 60
    if video := model_obj.videos.first():
        video.duration = duration_seconds
        video.save(update_fields=["duration"])
    else:
        Video.objects.create(
            content_object=model_obj,
            duration=duration_seconds,
        )


def process_episode(
    episode_details: dict,
    season: Season,
    lang_suffix: str,
    *,
    is_main: bool,
    ignore_air_date: bool = False,
) -> None:
    air_date = episode_details.get("air_date")
    # Skip future episodes unless explicitly ignored
    if (
        not air_date or parse_date(air_date) > timezone.now().date()
    ) and not ignore_air_date:
        return

    tmdb_id = episode_details.get("id")
    episode_number = episode_details.get("episode_number", 1)
    name = episode_details.get("name", "")
    overview = episode_details.get("overview", "")

    # Try to find existing episode by Season+Number OR TMDB ID
    episode = Episode.objects.filter(season=season, number=episode_number).first()
    if not episode and tmdb_id:
        episode = Episode.objects.filter(tmdb_id=tmdb_id).first()

    if not episode:
        episode = Episode.objects.populate(True).create(  # noqa: FBT003
            tmdb_id=tmdb_id,
            season=season,
            number=episode_number,
            name=name,
            overview=overview,
        )

    # Update language-specific fields
    setattr(episode, f"name_{lang_suffix}", name)
    if overview:
        setattr(episode, f"overview_{lang_suffix}", overview)

    if is_main:
        episode.tmdb_id = tmdb_id
        episode.name = name
        episode.overview = overview
        episode.air_date = air_date
        episode.rating = episode_details.get("vote_average", 0)

        process_duration(episode_details, episode)

        if still := tmdb_client.download_image(episode_details.get("still_path")):
            episode.still.save(still.name, still, save=False)

    episode.save()


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

            # Update translation ONLY if the field is empty
            name_field = f"name_{lang_suffix}"
            if not getattr(genre_obj, name_field, None):
                setattr(genre_obj, name_field, local_name)
                genre_obj.save(update_fields=[name_field])

            if is_default:
                genres_to_add.append(genre_obj)

    if genres_to_add:
        title.genres.set(genres_to_add)


def update_title_from_tmdb_details(
    title_obj: Title,
    tmdb_id: int,
    title_type: Title.ContentType,
) -> None:
    """
    Fetches details for all languages, updates the Title object,
    and schedules/processes related data (Genres, Seasons).
    """
    genres_lang_map: dict[str, list[dict]] = {}

    for lang_code, _ in LANGUAGES:
        is_main = lang_code == DEFAULT_LANGUAGE
        lang_suffix = get_model_lang_suffix(lang_code)

        # Only fetch heavier data (videos/credits) for main language
        params = {
            "language": lang_code,
            "append_to_response": "videos,credits" if is_main else "",
        }

        details = tmdb_client.get_details(tmdb_id, title_type, params)
        if not details:
            continue

        # 1. Store Genres
        genres_lang_map[lang_suffix] = details.get("genres", [])

        # 2. Translations (Title/Description)
        api_title = details.get("title") or details.get("name") or ""
        overview = details.get("overview", "")
        setattr(title_obj, f"title_{lang_suffix}", api_title)
        if overview:
            setattr(title_obj, f"description_{lang_suffix}", overview)

        # 3. Handle Main Language Specifics
        if is_main:
            title_obj.title = api_title
            title_obj.description = overview
            title_obj.rating = details.get("vote_average", 0)

            release = details.get("release_date") or details.get("first_air_date")
            title_obj.release_date = release or None

            videos = details.get("videos", {}).get("results", [])
            cast = details.get("credits", {}).get("cast", [])

            title_obj.trailer_url = get_trailer_url(videos)
            title_obj.cast = get_cast_list(cast)

            process_duration(details, title_obj)
            process_title_images(title_obj, details)

        # 4. Handle Series Specifics (Seasons)
        if title_type == Title.ContentType.SERIES and is_main:
            seasons = details.get("seasons", [])
            if seasons_details := [
                {"tmdb_id": s.get("id"), "number": s.get("season_number")}
                for s in seasons
                if s.get("episode_count", 0) > 0
            ]:
                populate_seasons_from_tmdb.delay(title_obj.id, tmdb_id, seasons_details)

    # Save changes before processing M2M
    title_obj.save()
    process_genres(title_obj, genres_lang_map)


def import_or_update_title(
    tmdb_id: int,
    title_type: Title.ContentType,
    initial_data: dict | None = None,
    *,
    force: bool = False,
) -> tuple[bool, Title | None]:
    """
    Creates or updates a Title based on TMDB ID.
    If 'initial_data' is not provided, it fetches basic info first.
    """
    if (
        not force
        and Title.objects.filter(
            tmdb_id=tmdb_id,
            added_by=Title.AddedBy.TMDB,
            content_type=title_type,
        ).exists()
    ):
        logger.info(
            "Title with TMDB ID %s and type %s already exists. Skipping creation.",
            tmdb_id,
            title_type,
        )
        return False, None

    # If we don't have initial data (e.g. from discovery), fetch it now.
    # This prevents creating a Title with empty fields if the subsequent
    # detailed fetch fails.
    if not initial_data:
        initial_data = tmdb_client.get_details(
            tmdb_id,
            title_type,
            params={"language": DEFAULT_LANGUAGE},
        )

    if not initial_data:
        logger.error("Could not fetch initial data for TMDB ID %s", tmdb_id)
        return False, None

    try:
        item_title = (initial_data.get("title") or initial_data.get("name")) or ""
        release_date = initial_data.get("release_date") or initial_data.get(
            "first_air_date",
        )

        with transaction.atomic():
            new_title, _ = Title.objects.populate(True).get_or_create(  # noqa: FBT003
                tmdb_id=tmdb_id,
                defaults={
                    "tmdb_id": tmdb_id,
                    "title": item_title,
                    "description": initial_data.get("overview", ""),
                    "content_type": title_type,
                    "release_date": release_date or None,
                    "rating": initial_data.get("vote_average", 0),
                    "added_by": Title.AddedBy.TMDB,
                },
            )

        # Fetch full details (multilingual, images, etc.) and update
        update_title_from_tmdb_details(new_title, tmdb_id, title_type)

    except Exception as e:
        logger.exception(
            "Error processing %s with ID %s",
            title_type,
            tmdb_id,
            exc_info=e,
        )
        return False, None

    return True, new_title


def get_discovery_date_range(content_type: str) -> tuple[str, str]:
    """
    Calculates the date range for back-filling content.
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


def _populate_discovery_titles(
    content_type: Title.ContentType,
    params: dict,
) -> list[Title]:
    """
    Generic function to fetch discovery results and populate titles.
    """
    all_created_titles = []

    for page in range(1, MAX_PAGES + 1):
        params["page"] = page
        results = tmdb_client.discover(content_type, params)
        if not results:
            break

        for item in results:
            success, title = import_or_update_title(
                item["id"],
                content_type,
                initial_data=item,
            )
            if success and title:
                all_created_titles.append(title)

    return all_created_titles


@shared_task(**default_task_params("populate_episode_from_tmdb"))
def populate_episode_from_tmdb(self, season_id: str, episode_number: int):
    season = Season.objects.prefetch_related("title").get(id=season_id)
    title_tmdb_id = season.title.tmdb_id

    if not title_tmdb_id:
        return

    for lang_code, _ in LANGUAGES:
        is_main = lang_code == DEFAULT_LANGUAGE
        lang_suffix = get_model_lang_suffix(lang_code)

        episode_details = tmdb_client.get_episode_details(
            title_tmdb_id,
            season.number,
            episode_number,
            params={"language": lang_code},
        )

        if not episode_details:
            continue

        process_episode(
            episode_details,
            season,
            lang_suffix,
            is_main=is_main,
            ignore_air_date=True,
        )


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

        season_details = tmdb_client.get_season_details(
            title_tmdb_id,
            season.number,
            params={"language": lang_code},
        )
        if not season_details:
            continue

        episodes = season_details.get("episodes", [])
        for episode_data in episodes:
            process_episode(episode_data, season, lang_suffix, is_main=is_main)


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

            details = tmdb_client.get_season_details(
                title_tmdb_id,
                season_data["number"],
                params={"language": lang_code},
            )
            if not details:
                continue

            air_date = details.get("air_date")
            now_date = timezone.now().date()
            if not air_date or parse_date(air_date) > now_date:
                continue

            season, _ = Season.objects.get_or_create(
                tmdb_id=details.get("id"),
                defaults={
                    "tmdb_id": details.get("id"),
                    "title": title,
                    "number": details.get("season_number", 1),
                    "name": details.get("name", ""),
                    "overview": details.get("overview", ""),
                    "air_date": air_date,
                    "rating": details.get("vote_average", 0),
                },
            )

            name_field = f"name_{lang_suffix}"
            overview_field = f"overview_{lang_suffix}"
            setattr(season, name_field, details.get("name", ""))
            already_have_overview = getattr(season, overview_field, "")
            if not already_have_overview:
                setattr(season, overview_field, details.get("overview", ""))

            if is_main:
                process_title_images(season, details)

            season.save()


@shared_task(**default_task_params("populate_title_admin_task"))
def populate_title_admin_task(self, tmdb_id: int, title_type: str) -> None:
    """
    Task to manually import a title by ID (via Admin).
    Fetches details first to ensure we don't create an empty record.
    """
    import_or_update_title(tmdb_id, title_type, initial_data=None, force=True)


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

    created_movies = _populate_discovery_titles(Title.ContentType.MOVIE, params)

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

    created_series = _populate_discovery_titles(Title.ContentType.SERIES, params)

    if created_series:
        title_payload = [{"id": s.id, "title": s.title} for s in created_series]
        send_titles_added_email_task.delay(title_payload, Title.ContentType.SERIES)

    return f"{len(created_series)} series created."


@shared_task(**default_task_params("calculate_video_duration"))
def calculate_video_duration(self, video_id):
    try:
        video = Video.objects.get(id=video_id)
        if not video.source_file:
            return

        duration = get_video_duration(video.source_file.url)
        if duration > 0:
            video.duration = duration
            video.save(update_fields=["duration"])
    except Video.DoesNotExist as e:
        logger.exception("Video with ID %s does not exist", video_id, exc_info=e)

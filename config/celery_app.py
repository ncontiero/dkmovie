import os

from celery import Celery
from celery.schedules import crontab
from celery.signals import setup_logging

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

app = Celery("dkmovie")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")


@setup_logging.connect
def config_loggers(*args, **kwargs):
    from logging.config import dictConfig  # noqa: PLC0415

    from django.conf import settings  # noqa: PLC0415

    dictConfig(settings.LOGGING)


# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


@app.on_after_finalize.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
    from dkmovie.titles.tasks import populate_movies_from_tmdb  # noqa: PLC0415
    from dkmovie.titles.tasks import populate_series_from_tmdb  # noqa: PLC0415

    sender.add_periodic_task(
        crontab(minute=0, hour=0),
        populate_movies_from_tmdb.s(),
        name="Populate movies from TMDB",
    )
    sender.add_periodic_task(
        crontab(minute=0, hour=0),
        populate_series_from_tmdb.s(),
        name="Populate series from TMDB",
    )

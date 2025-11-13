# DkMovie

[![Built with DKCutter Django](https://img.shields.io/badge/built%20with-DKCutter%20Django-56BEB8.svg)](https://github.com/ncontiero/dkcutter-django)
[![license mit](https://img.shields.io/badge/licence-MIT-56BEB8)](LICENSE)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)

A Django project of films and series.

## Settings

Moved to [settings](https://github.com/ncontiero/dkcutter-django/blob/main/docs/settings.md).

## Basic Commands

### Setting Up Your Users

- To create a **superuser account**, use this command:

```bash
uv run python manage.py createsuperuser
```

### Type checks

Running type checks with mypy:

```bash
uv run mypy dkmovie
```

### Test coverage

To run the tests, check your test coverage, and generate an HTML coverage report:

```bash
uv run coverage run -m pytest
uv run coverage html
uv run open htmlcov/index.html
```

#### Running tests with pytest

```bash
uv run pytest
```

### Celery

This app comes with Celery.

To run a celery worker:

```bash
cd dkmovie
uv run celery -A config.celery_app worker -l info
```

Please note: For Celery's import magic to work, it is important where the celery commands are run. If you are in the same folder with _manage.py_, you should be right.

To run [periodic tasks](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html), you'll need to start the celery beat scheduler service. You can start it as a standalone process:

```bash
cd dkmovie
uv run celery -A config.celery_app beat
```

or you can embed the beat service inside a worker with the -B option (not recommended for production use):

```bash
cd dkmovie
uv run celery -A config.celery_app worker -B -l info
```

### Email Server

In development, it is often nice to be able to see emails that are being sent from your application. For that reason local SMTP server [Mailpit](https://github.com/axllent/mailpit/) with a web interface is available as docker container.

Container mailpit will start automatically when you will run all docker containers.
Please check [dkcutter-django Docker documentation](https://github.com/ncontiero/dkcutter-django/blob/main/docs/deployment-with-docker.md) for more details how to start all containers.

With Mailpit running, to view messages that are sent by your application, open your browser and go to `http://127.0.0.1:8025`

### React Email

With [React Email](https://react.email/) you can create emails more easily and accessibly using React components.

You can view and edit your emails in the `emails` directory. To see the changes in real-time, run the following command and access <http://localhost:3001> in your browser:

```bash
<package manager> run dev:email
```

> [!NOTE]
> Replace `<package manager>` with the package manager you selected for the frontend (npm, pnpm, yarn, or bun).

To build the emails and make them available for use in Django, run the build command:

```bash
<package manager> run build:email
```

## Deployment

The following details how to deploy this application.

### Docker

See detailed [Docker documentation](https://github.com/ncontiero/dkcutter-django/blob/main/docs/deployment-with-docker.md).

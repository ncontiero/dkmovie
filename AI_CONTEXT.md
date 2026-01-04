# Project Context: DKMovie

## Overview

DKMovie is a full-stack application for managing and viewing movies and series. It uses a Django backend with Django Ninja for the API and a React frontend.

## Tech Stack

- **Backend**: Python, Django, Django Ninja.
- **Frontend**: React, TypeScript, TanStack Router, Tailwind CSS (assumed).
- **Database**: PostgreSQL (configured in settings).
- **Task Queue**: Celery with Redis.
- **Authentication**: django-allauth.

## Key Directories

- `dkmovie/titles`: Core app for Movies, Series, Seasons, and Episodes.
- `dkmovie/users`: User management.
- `config/`: Django project configuration (settings, urls).
- `dkmovie/src`: React frontend source code.

## Data Models

- **Title**: Represents a Movie or Series.
  - Fields: `title`, `description`, `content_type` (MOVIE/SERIES), `status`, `release_date`, `rating`, `genres`, `poster`, `cover`.
- **Season**: Belongs to a Title (Series).
  - Fields: `number`, `name`, `overview`, `poster`.
- **Episode**: Belongs to a Season.
  - Fields: `number`, `name`, `overview`, `still`, `duration`.

## API Structure

- Base URL: `/api/`
- Router: `config/api/main.py`
- Titles endpoints: `dkmovie/titles/routes/titles.py`
- Genres endpoints: `dkmovie/titles/routes/genres.py`

## Conventions

- **API**: Use Django Ninja `Router`. Schemas in `schemas.py`.
- **Frontend**: Functional components, Hooks.
- **Styling**: `index.css` (likely Tailwind).

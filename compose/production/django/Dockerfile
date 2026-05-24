FROM docker.io/node:24.16.0-bookworm-slim AS client-base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM client-base AS client-deps

COPY ./package.json ./pnpm-lock.yaml* ./pnpm-workspace.yaml* ./
COPY ./emails/package.json ./emails/

# Railway does not accept the same image for multiple cached services
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm install --frozen-lockfile

FROM client-base AS client-builder

ARG DJANGO_AWS_PUBLIC_STORAGE_BUCKET_NAME
ARG DJANGO_AWS_S3_PUBLIC_CUSTOM_DOMAIN

ENV DJANGO_AWS_PUBLIC_STORAGE_BUCKET_NAME=${DJANGO_AWS_PUBLIC_STORAGE_BUCKET_NAME}
ENV DJANGO_AWS_S3_PUBLIC_CUSTOM_DOMAIN=${DJANGO_AWS_S3_PUBLIC_CUSTOM_DOMAIN}

COPY --from=client-deps /app/node_modules /app/node_modules
COPY --from=client-deps /app/emails/node_modules /app/emails/node_modules
COPY . /app

RUN pnpm build
RUN pnpm build:email

FROM client-base AS client-build

COPY . /app
COPY --from=client-builder /app/webpack-stats.json /app/webpack-stats.json
COPY --from=client-builder /app/dkmovie/static/bundles /app/dkmovie/static/bundles
COPY --from=client-builder /app/dkmovie/templates/emails /app/dkmovie/templates/emails

# define an alias for the specific python version used in this file.
FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim AS python-build-stage

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

# Install apt packages
RUN apt-get update && apt-get install --no-install-recommends -y \
  # dependencies for building Python packages
  build-essential \
  ffmpeg \
  # psycopg dependencies
  libpq-dev

# Requirements are installed here to ensure they will be cached.
COPY pyproject.toml uv.lock ./
# Railway does not accept the same image for multiple cached services
# RUN --mount=type=cache,target=/root/.cache/uv \
#     uv sync --locked --no-install-project --no-dev
RUN uv sync --locked --no-install-project --no-dev

COPY --from=client-build ${APP_HOME} ${APP_HOME}

# Railway does not accept the same image for multiple cached services
# RUN --mount=type=cache,target=/root/.cache/uv \
#     uv sync --locked --no-dev
RUN uv sync --locked --no-dev

# Python 'run' stage
FROM python:3.14-slim-bookworm AS python-run-stage

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

RUN addgroup --system django \
  && adduser --system --ingroup django django

# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  ffmpeg \
  # psycopg dependencies
  libpq5 \
  # entrypoint
  wait-for-it \
  # Translations dependencies
  gettext \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

COPY --chown=django:django ./compose/production/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY --chown=django:django ./compose/production/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start
COPY --chown=django:django ./compose/production/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

COPY --chown=django:django ./compose/production/django/celery/beat/start /start-celerybeat
RUN sed -i 's/\r$//g' /start-celerybeat
RUN chmod +x /start-celerybeat

COPY --chown=django:django ./compose/production/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower

# Copy the application from the builder
COPY --from=python-build-stage --chown=django:django ${APP_HOME} ${APP_HOME}

# make django owner of the WORKDIR directory as well.
RUN chown django:django ${APP_HOME}

# Place executables in the environment at the front of the path
ENV PATH="${APP_HOME}/.venv/bin:$PATH"

USER django

RUN DATABASE_URL="" \
  TMDB_API_KEY="" \
  DJANGO_AWS_ACCESS_KEY_ID="" \
  DJANGO_AWS_SECRET_ACCESS_KEY="" \
  DJANGO_AWS_PUBLIC_STORAGE_BUCKET_NAME="" \
  DJANGO_AWS_PRIVATE_STORAGE_BUCKET_NAME="" \
  DJANGO_SETTINGS_MODULE="config.settings.test" \
  python manage.py compilemessages

ENTRYPOINT ["/entrypoint"]

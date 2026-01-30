# DkMovie

[![license mit](https://img.shields.io/badge/licence-MIT-6C47FF)](./LICENSE)
![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![Django](https://img.shields.io/badge/django-5.0-44B78B.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)

DkMovie is a full-stack video streaming platform. Built with performance and scalability in mind, it features adaptive bitrate streaming (HLS), multi-language support for audio and subtitles, and strict concurrency control.

## 🚀 Key Features

- **Adaptive Streaming (HLS)**: Automatically adjusts video quality (1080p, 720p, 480p) based on the user's bandwidth using FFmpeg transcoding.
- **Media Management**: Support for movies and series (seasons & episodes).
- **Audio & Subtitles**: Multi-track support with automatic extraction and separate management for different languages.
- **Concurrency Control**: Limits the number of simultaneous active screens per user with heartbeat monitoring.
- **Secure Storage**: Private object storage (Cloudflare R2/MinIO) with signed URLs for content protection.
- **Modern UI/UX**: Responsive interface with dark/light mode support and an advanced custom video player.

## 🛠️ Tech Stack

### Backend

- **Framework**: [Django 5.2](https://www.djangoproject.com/) & [Django Ninja](https://django-ninja.dev).
- **Database**: [PostgreSQL](https://www.postgresql.org).
- **Task Queue**: [Celery](https://docs.celeryq.dev/en/stable/) with [Redis](https://redis.io) (for video processing and background tasks).
- **Video Processing**: [FFmpeg](https://ffmpeg.org) (HLS segmentation, transcoding, thumbnail generation).
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) / [MinIO](https://github.com/minio/minio) (via [`django-storages`](https://github.com/jschneier/django-storages)).
- **Authentication**: [`django-allauth`](https://allauth.org) (Session & OAuth).
- **Emails**: [React Email](https://react.email/).

### Frontend

- **Framework**: [React](https://react.dev/) (TypeScript).
- **Build Tool**: [Rspack](https://rspack.dev).
- **State & Routing**: [TanStack Query](https://tanstack.com/query) & [TanStack Router](https://tanstack.com/router).
- **Styling**: [Tailwind CSS](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com) & [Shadcn/ui](https://ui.shadcn.com).
- **Player**: [ReactPlayer](https://github.com/cookpete/react-player) ([hls.js](https://github.com/video-dev/hls.js) integration) with custom overlay controls.

### Infrastructure

- **Containerization**: [Docker](https://www.docker.com) & [Docker Compose](https://docs.docker.com/compose/).
- **Reverse Proxy**: [Traefik](https://doc.traefik.io/traefik/) (Production).
- **Object Store**: Cloudflare R2 (Production) / MinIO (Local development).

## ⚡ Getting Started

This project is fully containerized. You only need Docker to run it locally.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Git](https://git-scm.com/) (optional, to clone the repo).

### Installation

#### Clone the repository

```bash
git clone https://github.com/ncontiero/dkmovie.git
cd dkmovie
```

#### Configure Environment Variables

Copy the example environment configuration folder to the active one.

```bash
cp -r .envs.example .envs
```

_Note: The default credentials in `.envs/.local/` are pre-configured for local development with Docker._

#### Build and Start

Run the project using the local docker-compose configuration.

```bash
docker compose -f docker-compose.local.yml up --build
```

_This may take a few minutes on the first run as it builds the images and installs dependencies (including FFmpeg)._

#### Access the Application

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:3000/api/docs>
- **Django Admin**: <http://localhost:3000/admin/>
- **MinIO Console**: <http://localhost:9001> (User/Pass: `minioAccessKey`/`minioSecretKey`)
- **Mailpit (Email)**: <http://localhost:8025>

### Post-Installation (Optional)

To create a superuser for the Django Admin:

```bash
docker compose -f docker-compose.local.yml run --rm django python manage.py createsuperuser
```

To run database migrations manually (usually handled automatically):

```bash
docker compose -f docker-compose.local.yml run --rm django python manage.py migrate
```

To compile messages (i18n support):

```bash
docker compose -f docker-compose.local.yml run --rm django python manage.py compilemessages
```

## 📦 Video Upload & Processing Flow

1. Create a title (movie/series) via Django Admin.
2. Upload a video file for the title.
3. The system automatically triggers a Celery task.
4. **FFmpeg** converts the video to HLS format (multiple resolutions) and extracts available audio/subtitle tracks.
5. Files are uploaded to the private S3 bucket.
6. Once completed, the video becomes available for streaming on the frontend.

## 📝 License

This project is licensed under the [MIT License](./LICENSE).

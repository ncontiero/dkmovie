# Implementation Plan: Streaming System

## Phase 1: Database Schema Updates

**Goal**: Allow storing video files for Movies and Episodes.

1.  **Update `Title` Model** (`dkmovie/titles/models.py`):
    - Add `video_file` (FileField) to `Title`.
    - Note: This field will be used only when `content_type` is `MOVIE`.
2.  **Update `Episode` Model** (`dkmovie/titles/models.py`):
    - Add `video_file` (FileField) to `Episode`.
3.  **Migrations**:
    - Create and run migrations to apply changes.

## Phase 2: Backend Streaming Logic

**Goal**: Efficiently serve video files with seek support.

1.  **Streaming Utility** (`dkmovie/titles/services/streaming.py`):
    - Create a helper class/function that:
      - Opens the video file.
      - Parses the `Range` HTTP header from the request.
      - Returns a `StreamingHttpResponse` with the specific byte range.
      - Sets correct `Content-Range`, `Content-Length`, and `Content-Type` headers.
    - _Why?_ Standard static file serving often lacks efficient seeking support for large files in some setups, and custom handling gives us control over access (e.g., checking permissions before streaming).

## Phase 3: API Endpoints

**Goal**: Expose video streams to the frontend.

1.  **Update API Routes** (`dkmovie/titles/routes/titles.py` or new `streaming.py`):
    - `GET /titles/{title_id}/stream`:
      - Validates `title_id`.
      - Checks if `content_type` is MOVIE.
      - Returns the video stream using the utility.
    - `GET /episodes/{episode_id}/stream`:
      - Validates `episode_id`.
      - Returns the video stream.

## Phase 4: Frontend Integration

**Goal**: Allow users to play videos in the browser.

1.  **Video Player Component** (`dkmovie/src/components/player/VideoPlayer.tsx`):
    - Use HTML5 `<video>` tag or a library like `react-player` or `video.js`.
    - Props: `src` (API URL), `poster`.
2.  **UI Updates**:
    - **Movie Details**: Add a "Play" button that opens the player (modal or new route) pointing to `/api/titles/{id}/stream`.
    - **Episode List**: Add "Play" button next to episodes pointing to `/api/episodes/{id}/stream`.

## Phase 5: Future Considerations (Post-MVP)

- **HLS/DASH**: Transcoding videos into HLS playlists (.m3u8) for adaptive bitrate streaming.
- **CDN**: Offloading video delivery to a CDN / Object Storage (S3).
- **Progress Tracking**: Saving user watch history (time code).

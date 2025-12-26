import logging
import mimetypes
import os
import re
from collections.abc import Generator

from django.http import HttpResponseRedirect
from django.http import StreamingHttpResponse

logger = logging.getLogger(__name__)


class RangeFileWrapper:
    """
    Wrapper to read a file in chunks, starting from a specific offset.
    Useful for supporting HTTP Range requests for local files.
    """

    def __init__(self, file_obj, offset=0, length=None, chunk_size=8192):
        self.file_obj = file_obj
        self.offset = offset
        self.length = length
        self.chunk_size = chunk_size
        if hasattr(self.file_obj, "seek"):
            self.file_obj.seek(offset)
        if length is not None:
            self.remaining = length
        elif hasattr(self.file_obj, "seek") and hasattr(self.file_obj, "tell"):
            self.file_obj.seek(0, os.SEEK_END)
            self.remaining = self.file_obj.tell() - offset
            self.file_obj.seek(offset)
        else:
            # Fallback if seek/tell not supported (should not happen for local files)
            self.remaining = float("inf")

    def __iter__(self) -> Generator[bytes]:
        try:
            while self.remaining > 0:
                bytes_to_read = min(self.chunk_size, self.remaining)
                data = self.file_obj.read(bytes_to_read)
                if not data:
                    break
                self.remaining -= len(data)
                yield data
        finally:
            self.file_obj.close()


def get_video_streaming_response(request, file_field):
    """
    Generates a response for video streaming.
    - If S3/Cloud Storage: Redirects to the presigned/public URL.
    - If Local Storage: Streams the file with Range Request support.
    """
    if not file_field:
        return None

    # 1. Try to redirect if it's a cloud storage URL (S3, MinIO, R2)
    try:
        # Try to generate a presigned URL with expiration (e.g., 3 hours = 10800s)
        url = file_field.storage.url(file_field.name, expire=10800)

        # If it's a remote URL, let the storage service
        # handle the streaming/range requests
        if url and url.startswith(("http:", "https:")):
            return HttpResponseRedirect(url)
    except TypeError:
        # Fallback for storages that don't support 'expire' (e.g., FileSystemStorage)
        try:
            url = file_field.url
            if url and url.startswith(("http:", "https:")):
                return HttpResponseRedirect(url)
        except Exception as e:
            logger.exception("Error accessing file_field.url", exc_info=e)
    except Exception as e:
        # If accessing .url fails or isn't useful, proceed to local handling
        logger.exception(
            "Error accessing file_field.url for remote storage",
            exc_info=e,
        )

    # 2. Local File Streaming Logic
    try:
        # Try to get the file size.
        # file_field.size works for both local and some remote storages,
        # but accessing .path is restricted to local.
        size = file_field.size
    except Exception:  # noqa: BLE001
        # If we can't even get the size, we can't stream properly with ranges
        return None

    # Determine Content-Type from the file name
    content_type, _ = mimetypes.guess_type(file_field.name)
    content_type = content_type or "video/mp4"

    range_header = request.META.get("HTTP_RANGE", "").strip()
    range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)

    if range_match:
        first_byte, last_byte = range_match.groups()
        first_byte = int(first_byte) if first_byte else 0
        last_byte = int(last_byte) if last_byte else size - 1

        if last_byte >= size:
            last_byte = size - 1

        length = last_byte - first_byte + 1

        resp = StreamingHttpResponse(
            RangeFileWrapper(file_field.open("rb"), offset=first_byte, length=length),
            status=206,
            content_type=content_type,
        )
        resp["Content-Range"] = f"bytes {first_byte}-{last_byte}/{size}"
    else:
        length = size
        resp = StreamingHttpResponse(
            RangeFileWrapper(file_field.open("rb")),
            status=200,
            content_type=content_type,
        )

    resp["Accept-Ranges"] = "bytes"
    resp["Content-Length"] = str(length)
    return resp

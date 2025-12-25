import mimetypes
import os
import re
from collections.abc import Generator

from django.http import StreamingHttpResponse


class RangeFileWrapper:
    """
    Wrapper to read a file in chunks, starting from a specific offset.
    Useful for supporting HTTP Range requests.
    """

    def __init__(self, file_obj, offset=0, length=None, chunk_size=8192):
        self.file_obj = file_obj
        self.offset = offset
        self.length = length
        self.chunk_size = chunk_size
        self.file_obj.seek(offset)
        if length is not None:
            self.remaining = length
        else:
            # If length is not provided, read until the end
            self.file_obj.seek(0, os.SEEK_END)
            self.remaining = self.file_obj.tell() - offset
            self.file_obj.seek(offset)

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
    Generates a StreamingHttpResponse that supports Range Requests for video files.
    """
    if not file_field:
        return None

    file_path = file_field.path
    size = file_field.size

    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or "video/mp4"

    range_header = request.headers.get("range", "").strip()
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

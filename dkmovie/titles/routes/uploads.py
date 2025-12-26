from ninja import Router
from ninja import Schema

from config.api.utils import ApiProcessError
from dkmovie.titles.services.uploads import generate_upload_url

router = Router()


class UploadSignRequest(Schema):
    file_name: str
    content_type: str


class UploadSignResponse(Schema):
    url: str
    method: str
    key: str
    headers: dict[str, str]


@router.post("/sign", response={200: UploadSignResponse})
def sign_upload(request, payload: UploadSignRequest):
    """
    Generates a presigned URL to upload a file directly to the storage (S3).
    """
    try:
        return generate_upload_url(payload.file_name, payload.content_type)
    except NotImplementedError as e:
        raise ApiProcessError(
            501,
            "Direct upload not supported by current storage backend.",
        ) from e
    except Exception as e:
        raise ApiProcessError(500, "Failed to generate upload URL", str(e)) from e

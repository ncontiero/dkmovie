from uuid import uuid4

from django.core import signing
from django.core.exceptions import ValidationError
from ninja import Router
from ninja import Schema

from .registry import get_field
from .services import S3MultipartManager
from .services import TransferredPart
from .services import TransferredParts

router = Router()
manager = S3MultipartManager()


class InitUploadSchema(Schema):
    field_id: str
    file_name: str
    file_size: int
    content_type: str
    instance_id: str | None = None


class PartSchema(Schema):
    part_number: int
    size: int
    upload_url: str


class InitResponseSchema(Schema):
    object_key: str
    upload_id: str
    parts: list[PartSchema]
    upload_signature: str


class CompletePartSchema(Schema):
    part_number: int
    size: int
    etag: str


class CompleteUploadSchema(Schema):
    upload_signature: str
    upload_id: str
    parts: list[CompletePartSchema]


class FinalizeSchema(Schema):
    upload_signature: str


@router.post("/initialize", response=InitResponseSchema)
def initialize_upload(request, payload: InitUploadSchema):
    field = get_field(payload.field_id)
    instance = None

    if field and payload.instance_id:
        model = field.model
        try:
            # Try to fetch the instance if we have an ID (update case)
            instance = model.objects.filter(pk=payload.instance_id).first()
        except (ValidationError, ValueError):
            instance = None

    if field:
        # If instance is found, generate_filename will use the model's logic.
        # If instance is None (creation), it will use the fallback in video_path.
        object_key = field.generate_filename(instance, payload.file_name)
    else:
        # Absolute fallback if field is not registered
        object_key = f"uploads/{uuid4()}/{payload.file_name}"

    data = manager.initialize_upload(
        object_key,
        payload.file_size,
        payload.content_type,
    )

    # Sign request data to ensure integrity later
    upload_signature = signing.dumps(
        {
            "field_id": payload.field_id,
            "object_key": object_key,
            "file_size": payload.file_size,
        },
    )

    return {
        "object_key": data.object_key,
        "upload_id": data.upload_id,
        "parts": [
            {
                "part_number": p.part_number,
                "size": p.size,
                "upload_url": p.upload_url,
            }
            for p in data.parts
        ],
        "upload_signature": upload_signature,
    }


@router.post("/complete")
def complete_upload(request, payload: CompleteUploadSchema):
    sig_data = signing.loads(payload.upload_signature)
    object_key = sig_data["object_key"]

    transferred_parts = TransferredParts(
        object_key=object_key,
        upload_id=payload.upload_id,
        parts=[TransferredPart(p.part_number, p.size, p.etag) for p in payload.parts],
    )

    manager.complete_upload(transferred_parts)
    return {"status": "ok"}


@router.post("/finalize")
def finalize_upload(request, payload: FinalizeSchema):
    sig_data = signing.loads(payload.upload_signature)
    object_key = sig_data["object_key"]

    # Verify existence/size
    size = manager.get_object_size(object_key)

    # Generate final field value signature
    field_value = signing.dumps({"object_key": object_key, "file_size": size})

    return {"field_value": field_value}

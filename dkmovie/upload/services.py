import math
from collections.abc import Iterator
from dataclasses import dataclass
from datetime import timedelta
from typing import ClassVar

import boto3
from botocore.config import Config
from django.conf import settings


@dataclass
class PresignedPartTransfer:
    part_number: int
    size: int
    upload_url: str


@dataclass
class PresignedTransfer:
    object_key: str
    upload_id: str
    parts: list[PresignedPartTransfer]


@dataclass
class TransferredPart:
    part_number: int
    size: int
    etag: str


@dataclass
class TransferredParts:
    object_key: str
    upload_id: str
    parts: list[TransferredPart]


class S3MultipartManager:
    """
    Manages multipart uploads to S3/MinIO using boto3.
    Adapted from django-s3-file-field.
    """

    _url_expiration = timedelta(hours=24)
    part_size: ClassVar[int] = 64 * 1024 * 1024  # 64MB

    def __init__(self):
        default_s3_client_kwargs = {
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
            "region_name": settings.AWS_S3_REGION_NAME,
            "config": Config(signature_version="s3v4"),
        }
        # Client for internal operations (backend <-> S3)
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            **default_s3_client_kwargs,
        )

        # Client for generating presigned URLs (accessible by frontend)
        # If AWS_S3_PUBLIC_ENDPOINT_URL is set (e.g. localhost for docker), use it.
        # Otherwise fall back to the standard endpoint.
        signing_endpoint = getattr(
            settings,
            "AWS_S3_PUBLIC_ENDPOINT_URL",
            settings.AWS_S3_ENDPOINT_URL,
        )

        if signing_endpoint != settings.AWS_S3_ENDPOINT_URL:
            self.signing_client = boto3.client(
                "s3",
                endpoint_url=signing_endpoint,
                **default_s3_client_kwargs,
            )
        else:
            self.signing_client = self.client

    def initialize_upload(
        self,
        object_key: str,
        file_size: int,
        content_type: str,
        bucket_name: str,
    ) -> PresignedTransfer:
        # Use internal client for API call
        resp = self.client.create_multipart_upload(
            Bucket=bucket_name,
            Key=object_key,
            ContentType=content_type,
        )
        upload_id = resp["UploadId"]

        parts = []
        for part_number, part_size in self._iter_part_sizes(file_size):
            # Use signing client for URL generation
            upload_url = self.signing_client.generate_presigned_url(
                ClientMethod="upload_part",
                Params={
                    "Bucket": bucket_name,
                    "Key": object_key,
                    "UploadId": upload_id,
                    "PartNumber": part_number,
                    "ContentLength": part_size,
                },
                ExpiresIn=int(self._url_expiration.total_seconds()),
            )
            parts.append(PresignedPartTransfer(part_number, part_size, upload_url))

        return PresignedTransfer(object_key, upload_id, parts)

    def complete_upload(self, transferred_parts: TransferredParts, bucket_name: str):
        parts_data = [
            {"PartNumber": part.part_number, "ETag": part.etag}
            for part in sorted(transferred_parts.parts, key=lambda p: p.part_number)
        ]

        self.client.complete_multipart_upload(
            Bucket=bucket_name,
            Key=transferred_parts.object_key,
            UploadId=transferred_parts.upload_id,
            MultipartUpload={"Parts": parts_data},
        )

    def abort_upload(self, object_key: str, upload_id: str, bucket_name: str):
        self.client.abort_multipart_upload(
            Bucket=bucket_name,
            Key=object_key,
            UploadId=upload_id,
        )

    def get_object_size(self, object_key: str, bucket_name: str) -> int:
        stats = self.client.head_object(Bucket=bucket_name, Key=object_key)
        return stats["ContentLength"]

    @classmethod
    def _iter_part_sizes(cls, file_size: int) -> Iterator[tuple[int, int]]:
        part_size = cls.part_size
        max_parts = 10_000

        if math.ceil(file_size / part_size) >= max_parts:
            part_size = math.ceil(file_size / max_parts)

        min_part_size = 5 * 1024 * 1024  # 5MB
        part_size = max(part_size, min_part_size)

        max_part_size = 5 * 1024 * 1024 * 1024  # 5GB
        part_size = min(part_size, max_part_size)

        remaining = file_size
        part_num = 1
        while remaining > 0:
            current = min(remaining, part_size)
            yield part_num, current
            part_num += 1
            remaining -= part_size

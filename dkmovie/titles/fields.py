import io

from django import forms
from django.core.files.base import File
from django.db import models

from .widgets import S3FilePondWidget


class S3PreUploadedFile(File):
    """
    Represents a file that has already been uploaded to S3 via direct upload.
    It has no local content, only points to the path (key).
    Setting _committed = True tells Django not to try saving it to storage again.
    """

    def __init__(self, name):
        self.name = name
        self.file = io.BytesIO(b"")
        self._committed = True

    def open(self, mode=None):
        self.seek(0)

    def __str__(self):
        return self.name

    @property
    def size(self):
        return 0


class S3FormFileField(forms.FileField):
    """
    Form field that accepts a string (S3 key) and converts it to a
    S3PreUploadedFile object, preventing Django from re-uploading it.
    """

    def to_python(self, data):
        if isinstance(data, str) and data:
            return S3PreUploadedFile(data)
        return super().to_python(data)


class S3FileField(models.FileField):
    """
    Model Field that uses S3FormFileField and S3FilePondWidget by default.
    """

    def formfield(self, **kwargs):
        defaults = {
            "form_class": S3FormFileField,
            "widget": S3FilePondWidget,
        }
        defaults.update(kwargs)
        return super().formfield(**defaults)

    def pre_save(self, model_instance, add):
        file = getattr(model_instance, self.attname)
        if file and hasattr(file, "file") and isinstance(file.file, S3PreUploadedFile):
            file._committed = True  # noqa: SLF001
        return super().pre_save(model_instance, add)

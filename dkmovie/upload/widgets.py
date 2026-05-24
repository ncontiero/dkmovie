from typing import TYPE_CHECKING
from typing import Any

from django.core import signing
from django.core.files import File
from django.forms import ClearableFileInput
from django.forms.widgets import FILE_INPUT_CONTRADICTION
from django.forms.widgets import CheckboxInput
from django.urls import reverse

if TYPE_CHECKING:
    from collections.abc import Mapping


class S3PlaceholderFile(File):
    def __init__(self, name: str, size: int) -> None:
        self.name = name
        self.size = size

    @classmethod
    def from_field(cls, field_value: str) -> S3PlaceholderFile | None:
        try:
            parsed_field = signing.loads(field_value)
        except signing.BadSignature:
            return None
        return cls(parsed_field["object_key"], parsed_field["file_size"])


class S3AdminFileWidget(ClearableFileInput):
    template_name = "upload/s3_file_input.html"

    def build_attrs(self, base_attrs, extra_attrs=None):
        attrs = super().build_attrs(base_attrs, extra_attrs)
        attrs["data-s3fileinput"] = ""
        attrs["data-upload-init"] = reverse("api-1.0.0:upload_initialize")
        attrs["data-upload-complete"] = reverse("api-1.0.0:upload_complete")
        attrs["data-upload-finalize"] = reverse("api-1.0.0:upload_finalize")
        return attrs

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        # Try to get the instance ID from the current value (FieldFile)
        if hasattr(value, "instance") and value.instance.pk:
            context["widget"]["attrs"]["data-instance-id"] = str(value.instance.pk)
        return context

    def value_from_datadict(
        self,
        data: Mapping[str, Any],
        files: Any,
        name: str,
    ) -> Any:
        if name in data:
            upload = data[name]
            if upload != "":
                # Try to parse our signed value
                if placeholder := S3PlaceholderFile.from_field(upload):
                    upload = placeholder
        elif name in files:
            upload = super().value_from_datadict(data, files, name)
        else:
            upload = None

        if not self.is_required and CheckboxInput().value_from_datadict(
            data,
            files,
            self.clear_checkbox_name(name),
        ):
            return FILE_INPUT_CONTRADICTION if upload else False
        return upload

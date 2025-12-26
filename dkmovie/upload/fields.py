import contextlib

from django import forms
from django.contrib.admin.widgets import AdminFileWidget
from django.core import signing
from django.db import models

from .registry import register_field
from .widgets import S3AdminFileWidget
from .widgets import S3PlaceholderFile


class S3FormFileField(forms.FileField):
    widget = S3AdminFileWidget

    def __init__(self, *args, **kwargs):
        self.model_field_id = kwargs.pop("model_field_id", None)

        # Admin often passes a widget class or instance to override the default.
        # We need to make sure we use our S3AdminFileWidget instead of AdminFileWidget.
        if widget := kwargs.get("widget"):
            if isinstance(widget, type) and issubclass(widget, AdminFileWidget):
                kwargs["widget"] = S3AdminFileWidget
            elif isinstance(widget, AdminFileWidget):
                # If it's an instance, we replace it with our widget,
                # attempting to preserve attributes if possible.
                kwargs["widget"] = S3AdminFileWidget(attrs=widget.attrs)

        super().__init__(*args, **kwargs)

    def widget_attrs(self, widget):
        attrs = super().widget_attrs(widget)
        if self.model_field_id:
            attrs.update({"data-field-id": self.model_field_id})
        return attrs

    def to_python(self, data):
        return None if data in self.empty_values else data


class S3FileField(models.FileField):
    @property
    def id(self) -> str:
        """Return the unique identifier for this field instance."""
        if not hasattr(self, "model"):
            msg = "contribute_to_class has not been called yet on this field."
            raise RuntimeError(msg)
        return str(self)

    def contribute_to_class(self, cls, name, **kwargs):
        super().contribute_to_class(cls, name, **kwargs)
        register_field(self)

    def formfield(self, **kwargs):
        # Use S3FormFileField as default
        kwargs.setdefault("form_class", S3FormFileField)
        # Pass model_field_id so the form/widget can identify the field
        kwargs.setdefault("model_field_id", self.id)

        return super().formfield(**kwargs)

    def save_form_data(self, instance, data):
        if isinstance(data, S3PlaceholderFile):
            data = data.name
        elif isinstance(data, str):
            with contextlib.suppress(signing.BadSignature, KeyError, TypeError):
                sig_data = signing.loads(data)
                data = sig_data["object_key"]
        super().save_form_data(instance, data)

import json
import uuid
from datetime import UTC
from datetime import date
from datetime import datetime
from datetime import timedelta
from decimal import Decimal

from django.db import models
from django.utils.translation import gettext_lazy as _
from ninja import Schema
from ninja.renderers import JSONRenderer

from config.api.main import ORJSONRenderer


class Color(models.TextChoices):
    RED = "red", "Red"


class Item(Schema):
    name: str
    rating: Decimal


def _render(renderer, data):
    return renderer.render(None, data, response_status=200)


def test_orjson_renderer_matches_default_renderer():
    data = {
        "id": uuid.uuid4(),
        "rating": Decimal("8.5"),
        "label": _("Name"),
        "day": date(2026, 10, 26),
        "duration": timedelta(minutes=90),
        "color": Color.RED,
        "item": Item(name="x", rating=Decimal("1.0")),
        "items": [1, "a", None, True],
        1: "int key",
    }

    assert json.loads(_render(ORJSONRenderer(), data)) == json.loads(
        _render(JSONRenderer(), data),
    )


def test_orjson_renderer_uses_utc_z_suffix():
    data = {"at": datetime(2026, 10, 26, 12, 0, 0, tzinfo=UTC)}

    assert json.loads(_render(ORJSONRenderer(), data)) == {
        "at": "2026-10-26T12:00:00Z",
    }

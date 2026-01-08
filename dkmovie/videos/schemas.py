from ninja import ModelSchema

from .models import VideoSprite


class VideoSpriteSchema(ModelSchema):
    class Meta:
        model = VideoSprite
        exclude = ["id", "video", "created_at"]

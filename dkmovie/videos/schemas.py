from ninja import ModelSchema

from .models import VideoSprite
from .models import VideoTrack


class VideoSpriteSchema(ModelSchema):
    class Meta:
        model = VideoSprite
        exclude = ["id", "video", "created_at"]


class VideoTrackSchema(ModelSchema):
    class Meta:
        model = VideoTrack
        exclude = [
            "id",
            "video",
            "audio_playlist",
            "source_audio_index",
            "source_subtitle_index",
            "created_at",
            "updated_at",
        ]

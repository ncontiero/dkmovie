from ninja import ModelSchema

from .models import VideoMarker
from .models import VideoSprite
from .models import VideoTrack


class VideoSpriteSchema(ModelSchema):
    class Meta:
        model = VideoSprite
        exclude = ["id", "video", "created_at"]


class VideoTrackSchema(ModelSchema):
    has_audio: bool = False

    class Meta:
        model = VideoTrack
        fields = ["language", "label", "is_original", "subtitle_file"]

    @staticmethod
    def resolve_has_audio(track: VideoTrack) -> bool:
        return track.has_audio


class VideoMarkerSchema(ModelSchema):
    class Meta:
        model = VideoMarker
        exclude = ["id", "video"]

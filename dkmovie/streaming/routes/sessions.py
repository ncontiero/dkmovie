from ninja import Router
from ninja import Schema
from ninja import Status

from dkmovie.streaming.services.concurrency import register_heartbeat
from dkmovie.streaming.services.concurrency import release_session

router = Router()


class HeartbeatSchema(Schema):
    session_id: str


class HeartbeatResponse(Schema):
    allowed: bool


@router.post("/heartbeat", response={200: HeartbeatResponse})
def heartbeat(request, payload: HeartbeatSchema):
    allowed = register_heartbeat(request.user.id, payload.session_id)
    return HeartbeatResponse(allowed=allowed)


@router.post("/release", response={204: None})
def release(request, payload: HeartbeatSchema):
    release_session(request.user.id, payload.session_id)
    return Status(204, None)

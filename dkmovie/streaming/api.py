from django.utils.translation import gettext_lazy as _
from ninja import Router
from ninja.security import SessionAuth

from .routes.sessions import router as sessions_router
from .routes.streaming import router as streaming_router

router = Router(auth=SessionAuth())

router.add_router("/", streaming_router, tags=[_("Streaming")])
router.add_router("/sessions", sessions_router, tags=[_("Streaming Sessions")])

from ninja import Router

from .routes.episodes import router as episodes_router
from .routes.genres import router as genres_router
from .routes.streaming import router as streaming_router
from .routes.titles import router as titles_router

router = Router()

router.add_router("/titles", titles_router, tags=["Titles"])
router.add_router("/genres", genres_router, tags=["Genres"])
router.add_router("/episodes", episodes_router, tags=["Episodes"])
router.add_router("/streaming", streaming_router, tags=["Streaming"])

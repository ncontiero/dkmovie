from ninja import Router

from .routes.episodes import router as episodes_router
from .routes.genres import router as genres_router
from .routes.titles import router as titles_router

router = Router()

router.add_router("/titles", titles_router)
router.add_router("/genres", genres_router)
router.add_router("/episodes", episodes_router)

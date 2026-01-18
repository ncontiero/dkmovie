from ninja import Router

from .routes.genres import router as genres_router
from .routes.titles import router as titles_router

router = Router()

router.add_router("/titles", titles_router, tags=["Titles"])
router.add_router("/genres", genres_router, tags=["Genres"])

from ninja import Router

from .routes.titles import router as titles_router

router = Router()

router.add_router("/titles", titles_router)

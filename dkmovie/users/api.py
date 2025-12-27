from ninja import Router

from .routes.language import router as language_router
from .routes.users import router as users_router

router = Router()


router.add_router("/users", users_router, tags=["Users"])
router.add_router("/language", language_router, tags=["Languages"])

from ninja import Router

from .routes.history import router as history_router
from .routes.language import router as language_router
from .routes.my_list import router as my_list_router
from .routes.users import router as users_router

router = Router()


router.add_router("/users/me", users_router, tags=["Users"])
router.add_router("/users/my_list", my_list_router, tags=["My List"])
router.add_router("/users/history", history_router, tags=["History"])
router.add_router("/language", language_router, tags=["Languages"])

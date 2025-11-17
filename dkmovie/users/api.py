from ninja import Router

from .routes.users import router as users_router

router = Router()


router.add_router("/users", users_router)

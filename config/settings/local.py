from .base import *  # noqa: F403
from .base import AWS_S3_ENDPOINT_URL
from .base import INSTALLED_APPS
from .base import MIDDLEWARE
from .base import WEBPACK_LOADER
from .base import config

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = True
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = config(
    "DJANGO_SECRET_KEY",
    default="XwTk5hwEoRJArJxFLke2xWIk3camyrVMOn2p9grLGYbFGHDeAm9a638SPe3xhZgC",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ["localhost", "0.0.0.0", "127.0.0.1"]  # noqa: S104

# CACHES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#caches
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "",
    },
}

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-host
EMAIL_HOST = config("EMAIL_HOST", default="mailpit")
# https://docs.djangoproject.com/en/dev/ref/settings/#email-port
EMAIL_PORT = 1025

# django-debug-toolbar
# ------------------------------------------------------------------------------
# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#prerequisites
INSTALLED_APPS += ["debug_toolbar"]
# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#middleware
MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]
# https://django-debug-toolbar.readthedocs.io/en/latest/configuration.html#debug-toolbar-config
DEBUG_TOOLBAR_CONFIG = {
    "DISABLE_PANELS": [
        "debug_toolbar.panels.redirects.RedirectsPanel",
        # Disable profiling panel due to an issue with Python 3.12:
        # https://github.com/jazzband/django-debug-toolbar/issues/1875
        "debug_toolbar.panels.profiling.ProfilingPanel",
    ],
    "SHOW_TEMPLATE_CONTEXT": True,
    "SHOW_TOOLBAR_CALLBACK": lambda request: True,
}
# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html#internal-ips
INTERNAL_IPS = ["127.0.0.1", "10.0.2.2"]

# django-extensions
# ------------------------------------------------------------------------------
# https://django-extensions.readthedocs.io/en/latest/installation_instructions.html#configuration
INSTALLED_APPS += ["django_extensions"]

# Celery
# ------------------------------------------------------------------------------
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#task-eager-propagates
CELERY_TASK_EAGER_PROPAGATES = True
# django-webpack-loader
# ------------------------------------------------------------------------------
WEBPACK_LOADER["DEFAULT"]["CACHE"] = not DEBUG

# django-allauth
# ------------------------------------------------------------------------------
# https://docs.allauth.org/en/latest/mfa/configuration.html
MFA_WEBAUTHN_ALLOW_INSECURE_ORIGIN = True

# STORAGES
# ------------------------------------------------------------------------------
_AWS_EXPIRY = 60 * 60
# https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
AWS_S3_OBJECT_PARAMETERS = {
    "CacheControl": f"max-age={_AWS_EXPIRY}, s-maxage={_AWS_EXPIRY}, must-revalidate",
}
# Custom setting for local dev: The endpoint accessible from the browser
AWS_S3_PUBLIC_ENDPOINT_URL = config(
    "DJANGO_AWS_S3_PUBLIC_ENDPOINT_URL",
    default="http://localhost:9000",
)
AWS_S3_URL_PROTOCOL = "http:" if AWS_S3_ENDPOINT_URL.startswith("http://") else "https:"

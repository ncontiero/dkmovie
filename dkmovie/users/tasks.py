import logging

from celery import shared_task
from django.conf import settings
from django.utils import translation
from django.utils.translation import gettext_lazy as _

from dkmovie.utils.tasks import default_task_params

from .utils import send_email

logger = logging.getLogger(__name__)


@shared_task(**default_task_params("send_email_task"))
def send_email_task(
    self,
    subject: str,
    body: str,
    from_email: str,
    to: list[str],
) -> None:
    send_email(subject, to, body=body, from_email=from_email)


@shared_task(**default_task_params("send_account_deleted_email_task"))
def send_account_deleted_email_task(
    self,
    username: str,
    email: str,
    language_code: str | None = None,
) -> None:
    if language_code:
        translation.activate(language_code)

    subject = _("Your account has been deleted")
    template_name = "emails/account-deleted.html"
    context = {"user": {"name": username, "email": email}}
    send_email(subject, [email], template=template_name, context=context)

    if language_code and language_code != settings.LANGUAGE_CODE:
        translation.deactivate()

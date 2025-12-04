from celery import shared_task
from django.core.mail import EmailMessage

from dkmovie.utils.tasks import default_task_params


@shared_task(**default_task_params("send_email_task"))
def send_email_task(
    self,
    subject: str,
    body: str,
    from_email: str,
    to: list[str],
) -> None:
    msg = EmailMessage(subject, body, from_email, to)
    msg.content_subtype = "html"
    msg.send()

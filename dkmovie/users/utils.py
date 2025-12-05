from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.template.loader import render_to_string


def send_email(  # noqa: PLR0913
    subject: str,
    to: list[str],
    template: str | None = None,
    body: str | None = None,
    from_email: str | None = settings.DEFAULT_FROM_EMAIL,
    context: dict | None = None,
):
    """Send an email to a list of recipients.

    Args:
        subject: Email subject line.
        to: List of email addresses to send to.
        template: Path to the email template.
        body: Email body.
        context: Additional context data for the email template, if any.
    """

    if not body and not template:
        msg = "Either body or template must be provided"
        raise ValueError(msg)

    context = context or {}
    context = {"current_site": get_current_site(None)} | context
    body = render_to_string(template, context).strip() if template else body

    msg = EmailMessage(subject, body, from_email, to)
    msg.content_subtype = "html"
    msg.send()

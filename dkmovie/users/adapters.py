from __future__ import annotations

import logging
import typing

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

if typing.TYPE_CHECKING:
    from allauth.socialaccount.models import SocialLogin
    from django.http import HttpRequest

    from .models import User


logger = logging.getLogger(__name__)


class AccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        """
        Overrides the default send_mail method to change the template directory.
        Default path is 'account/email'.
        We want to change it to 'emails/account'.
        """
        # Check if the standard path is in the prefix and replace it
        if "account/email" in template_prefix:
            template_prefix = template_prefix.replace("account/email", "emails/account")
        if "mfa/email" in template_prefix:
            template_prefix = template_prefix.replace(
                "mfa/email",
                "emails/account/mfa",
            )
        if "socialemails/account" in template_prefix:
            template_prefix = template_prefix.replace(
                "socialemails/account",
                "emails/account/socialaccount",
            )
        # Call the parent class method with the new prefix
        super().send_mail(template_prefix, email, context)


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(
        self,
        request: HttpRequest,
        sociallogin: SocialLogin,
        data: dict[str, typing.Any],
    ) -> User:
        """
        Populates user information from social provider info.

        See: https://docs.allauth.org/en/latest/socialaccount/advanced.html#creating-and-populating-user-instances
        """
        user = super().populate_user(request, sociallogin, data)
        if not user.name:
            if name := data.get("name"):
                user.name = name
            elif first_name := data.get("first_name"):
                user.name = first_name
                if last_name := data.get("last_name"):
                    user.name += f" {last_name}"
        return user

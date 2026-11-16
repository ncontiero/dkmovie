import json
from http import HTTPStatus

import pytest
from allauth.account.internal.flows.reauthentication import get_reauthentication_flows
from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model
from django.test import RequestFactory

from dkmovie.users.adapters import AccountAdapter

User = get_user_model()


@pytest.mark.django_db
def test_login_code_email_templates_render_with_code():
    request = RequestFactory().get("/")
    adapter = AccountAdapter(request=request)

    msg = adapter.render_mail(
        "emails/account/login_code",
        "social@example.com",
        {
            "email": "social@example.com",
            "code": "ABCD1234",
            "reauthentication": True,
        },
    )

    assert "Sign-In Code" in msg.subject
    assert "ABCD1234" in msg.body


@pytest.mark.django_db
def test_social_only_user_can_reauthenticate_by_code(client, monkeypatch):
    sent_emails: list[dict] = []

    def fake_delay(**kwargs):
        sent_emails.append(kwargs)

    monkeypatch.setattr("dkmovie.users.adapters.send_email_task.delay", fake_delay)

    user = User.objects.create_user(email="social@example.com", password=None)
    user.set_unusable_password()
    user.save(update_fields=["password"])
    EmailAddress.objects.create(
        user=user,
        email=user.email,
        verified=True,
        primary=True,
    )

    flows = get_reauthentication_flows(user)
    assert any(
        flow["id"] == "reauthenticate_by_code"
        and {"email": "social@example.com"} in flow["recipients"]
        for flow in flows
    )

    client.force_login(user)

    request_response = client.post(
        "/api/auth/browser/v1/auth/reauthenticate/code/request",
        data=json.dumps({"email": user.email}),
        content_type="application/json",
    )
    assert request_response.status_code == HTTPStatus.OK
    assert len(sent_emails) == 1

    resend_response = client.post(
        "/api/auth/browser/v1/auth/reauthenticate/code/resend",
    )
    assert resend_response.status_code == HTTPStatus.OK
    expected_email_count = 2
    assert len(sent_emails) == expected_email_count

    session_state = client.session["account_email_reauthentication_code"]
    code = session_state["code"]
    assert code in sent_emails[-1]["body"]

    confirm_response = client.post(
        "/api/auth/browser/v1/auth/reauthenticate/code/confirm",
        data=json.dumps({"code": code}),
        content_type="application/json",
    )
    assert confirm_response.status_code == HTTPStatus.OK
    payload = confirm_response.json()
    assert payload["meta"]["is_authenticated"] is True

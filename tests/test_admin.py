from http import HTTPStatus

import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_admin_page_accessible_by_admin(admin_client):
    response = admin_client.get(reverse("admin:index"))
    assert response.status_code == HTTPStatus.OK


@pytest.mark.django_db
def test_admin_page_not_accessible_by_normal_user(client):
    response = client.get(reverse("admin:index"))
    assert response.status_code == HTTPStatus.FOUND
    assert response.url == "/admin/login/?next=/admin/"
    assert response.wsgi_request.user.is_anonymous
    assert response.wsgi_request.user.is_authenticated is False

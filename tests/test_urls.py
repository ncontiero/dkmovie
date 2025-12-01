from http import HTTPStatus

from django.urls import resolve
from django.urls import reverse


def test_home(admin_client):
    url = reverse("home")
    assert resolve(url).view_name == "home"
    response = admin_client.get(url)
    assert response.status_code == HTTPStatus.OK
    assert "pages/home.html" in [t.name for t in response.templates]
    assert '<div id="root"></div>' in response.content.decode()


def test_catch_all(admin_client):
    url = "/foo"
    assert resolve(url).view_name == "home"
    response = admin_client.get(url)
    assert response.status_code == HTTPStatus.OK
    assert "pages/home.html" in [t.name for t in response.templates]
    assert '<div id="root"></div>' in response.content.decode()

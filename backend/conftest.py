import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def therapist_a(db):
    return User.objects.create_user(
        email="a@test.com",
        password="pass1234",
        is_therapist=True,  # optional, but explicit
    )

@pytest.fixture
def therapist_b(db):
    return User.objects.create_user(
        email="b@test.com",
        password="pass1234",
        is_therapist=True,
    )

@pytest.fixture
def auth_client_a(api_client, therapist_a):
    api_client.force_authenticate(user=therapist_a)
    return api_client

@pytest.fixture
def auth_client_b(api_client, therapist_b):
    api_client.force_authenticate(user=therapist_b)
    return api_client

# backend/conftest.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

# ---------- Clients ----------

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def anon_client():
    """Unauthenticated client (for register/login tests)."""
    return APIClient()


# ---------- Users ----------

@pytest.fixture
def therapist_a(db):
    return User.objects.create_user(
        email="a@test.com",
        password="pass1234",
        is_therapist=True,
    )

@pytest.fixture
def therapist_b(db):
    return User.objects.create_user(
        email="b@test.com",
        password="pass1234",
        is_therapist=True,
    )

@pytest.fixture
def non_therapist(db):
    return User.objects.create_user(
        email="patient@test.com",
        password="pass1234",
        is_therapist=False,
    )


# ---------- Authenticated Clients ----------

@pytest.fixture
def auth_client_a(api_client, therapist_a):
    api_client.force_authenticate(user=therapist_a)
    return api_client

@pytest.fixture
def auth_client_b(api_client, therapist_b):
    api_client.force_authenticate(user=therapist_b)
    return api_client

@pytest.fixture
def auth_client_non_therapist(api_client, non_therapist):
    api_client.force_authenticate(user=non_therapist)
    return api_client


# ---------- Registration Helpers ----------

@pytest.fixture
def valid_register_data():
    return {
        "email": "newuser@test.com",
        "password": "StrongPass123",
        "password_confirm": "StrongPass123",
    }

@pytest.fixture
def duplicate_email_user(db):
    return User.objects.create_user(
        email="duplicate@test.com",
        password="StrongPass123",
    )
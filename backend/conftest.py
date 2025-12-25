# backend/conftest.py

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APIClient

from therapy_sessions.models import TherapySession, SessionAudio
from patients.models import Patient


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


# =========================================================
# ADDITIONS FOR SESSIONS / AUDIO / TRANSCRIPTION TESTS
# =========================================================

@pytest.fixture
def patient_a(db, therapist_a):
    """
    Patient owned by therapist_a.
    Adjust fields if your Patient model uses different names.
    """
    return Patient.objects.create(
        therapist=therapist_a,
        full_name="Patient A",
    )


@pytest.fixture
def session_a(db, therapist_a, patient_a):
    """
    TherapySession owned by therapist_a for patient_a.
    Adjust fields if your TherapySession model differs.
    """
    return TherapySession.objects.create(
        therapist=therapist_a,
        patient=patient_a,
        session_date=timezone.now(),
        status="scheduled",
    )


@pytest.fixture
def make_audio_file():
    def _make():
        return SimpleUploadedFile(
            name="test.wav",
            content=b"RIFF....WAVEfmt ",
            content_type="audio/wav",
        )
    return _make



@pytest.fixture
def session_a_with_audio(db, session_a, make_audio_file):
    SessionAudio.objects.create(
        session=session_a,
        audio_file=make_audio_file(),
        original_filename="test.wav",
        language_code="en",
    )
    return session_a


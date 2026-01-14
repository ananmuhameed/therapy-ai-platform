import pytest
from django.contrib.auth import get_user_model
from patients.serializers import PatientSerializer
from patients.models import Patient

User = get_user_model()


class Request:
    def __init__(self, user):
        self.user = user


# -------------------------
# VALID EGYPTIAN PHONES
# -------------------------
@pytest.mark.django_db
@pytest.mark.parametrize("phone", [
    "01012345678",
    "01112345678",
    "01212345678",
    "01512345678",
    "+201012345678",
    "00201012345678",
    "010 1234 5678",
])
def test_valid_egyptian_phone_numbers(phone):
    therapist = User.objects.create_user(
        email="therapist@test.com",
        password="123456",
        is_therapist=True
    )

    serializer = PatientSerializer(
        data={
            "full_name": "Ahmed Mohamed Ali",
            "contact_phone": phone,
        },
        context={"request": Request(therapist)}
    )

    assert serializer.is_valid(), serializer.errors


# -------------------------
# INVALID PREFIX
# -------------------------
@pytest.mark.django_db
@pytest.mark.parametrize("phone", [
    "01712345678",
    "01912345678",
    "12345678901",
])
def test_invalid_egyptian_prefix(phone):
    therapist = User.objects.create_user(
        email="therapist2@test.com",
        password="123456",
        is_therapist=True
    )

    serializer = PatientSerializer(
        data={
            "full_name": "Ahmed Mohamed Ali",
            "contact_phone": phone,
        },
        context={"request": Request(therapist)}
    )

    assert not serializer.is_valid()
    assert "contact_phone" in serializer.errors


# -------------------------
# DUPLICATE EMAIL
# -------------------------
@pytest.mark.django_db
def test_duplicate_email_for_same_therapist():
    therapist = User.objects.create_user(
        email="therapist3@test.com",
        password="123456",
        is_therapist=True
    )

    Patient.objects.create(
        therapist=therapist,
        full_name="First Patient Name Test",
        contact_email="dup@test.com",
    )

    serializer = PatientSerializer(
        data={
            "full_name": "Second Patient Name Test",
            "contact_email": "dup@test.com",
        },
        context={"request": Request(therapist)}
    )

    assert not serializer.is_valid()
    assert "contact_email" in serializer.errors


# -------------------------
# DUPLICATE PHONE
# -------------------------
@pytest.mark.django_db
def test_duplicate_phone_for_same_therapist():
    therapist = User.objects.create_user(
        email="therapist4@test.com",
        password="123456",
        is_therapist=True
    )

    Patient.objects.create(
        therapist=therapist,
        full_name="First Patient Name Test",
        contact_phone="01012345678",
    )

    serializer = PatientSerializer(
        data={
            "full_name": "Second Patient Name Test",
            "contact_phone": "01012345678",
        },
        context={"request": Request(therapist)}
    )

    assert not serializer.is_valid()
    assert "contact_phone" in serializer.errors
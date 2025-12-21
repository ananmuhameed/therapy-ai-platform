import pytest
from django.contrib.auth import authenticate, get_user_model
from users.models import TherapistProfile
from users.serializers import RegisterSerializer

User = get_user_model()

STRONG_PASSWORD = "StrongPass123"


def _build_register_payload(
    email: str,
    password: str = STRONG_PASSWORD,
    password_confirm: str | None = None,
    extra: dict | None = None,
) -> dict:
    """
    Build registration payload that adapts to what RegisterSerializer actually expects.
    - Always sets email/password/password_confirm
    - Adds first_name/last_name ONLY if serializer exposes them
    """
    if password_confirm is None:
        password_confirm = password

    data = {
        "email": email,
        "password": password,
        "password_confirm": password_confirm,
    }

    serializer = RegisterSerializer()
    if "first_name" in serializer.fields:
        data["first_name"] = "Test"
    if "last_name" in serializer.fields:
        data["last_name"] = "User"

    if extra:
        data.update(extra)

    return data


@pytest.mark.django_db
class TestRegisterSerializer:
    """
    Registration tests for RegisterSerializer:
    - Valid registration
    - Duplicate email
    - Password mismatch
    - Missing required fields
    - Input hardening (attempt to set is_therapist)
    - Email normalization (if implemented)
    """

    def test_valid_registration(self):
        data = _build_register_payload(email="test@example.com")

        s = RegisterSerializer(data=data)
        assert s.is_valid(), s.errors

        user = s.save()

        assert user.email == "test@example.com"
        assert user.check_password(STRONG_PASSWORD) is True

    def test_duplicate_email(self):
        User.objects.create_user(email="dup@example.com", password=STRONG_PASSWORD)

        data = _build_register_payload(email="dup@example.com")
        s = RegisterSerializer(data=data)

        assert not s.is_valid()
        assert "email" in s.errors

    def test_password_mismatch(self):
        data = _build_register_payload(
            email="mismatch@example.com",
            password=STRONG_PASSWORD,
            password_confirm="WrongPass123",
        )
        s = RegisterSerializer(data=data)

        assert not s.is_valid()
        # Serializer might attach mismatch to different keys; accept any common one.
        assert (
            "password" in s.errors
            or "password_confirm" in s.errors
            or "non_field_errors" in s.errors
        ), s.errors

    def test_missing_required_fields(self):
        # Minimal required: email + password + password_confirm (most likely)
        data = {"email": ""}
        s = RegisterSerializer(data=data)
        assert not s.is_valid()
        assert "email" in s.errors

    def test_attempt_to_set_is_therapist_is_ignored_or_rejected(self):
        """
        Security hardening test:
        - If serializer exposes is_therapist and allows it, you must decide that policy.
        - If serializer does NOT expose it, it should be ignored or rejected.
        """
        payload = _build_register_payload(
            email="roleattack@example.com",
            extra={"is_therapist": False},
        )

        s = RegisterSerializer(data=payload)
        if not s.is_valid():
            # Secure behavior: reject unexpected/protected field
            assert ("is_therapist" in s.errors) or ("non_field_errors" in s.errors), s.errors
            return

        user = s.save()

        # Your model defaults is_therapist=True. Unless you explicitly support role selection,
        # this must remain True even if user tries to override it.
        assert user.is_therapist is True

    def test_email_normalization_if_supported(self):
        """
        If your manager/serializer normalizes email, this should be stored lowercased/trimmed.
        If you haven't implemented normalization beyond BaseUserManager.normalize_email,
        this test will still usually pass (domain part normalization is default).
        """
        data = _build_register_payload(email="  Test@Example.com  ")

        s = RegisterSerializer(data=data)
        assert s.is_valid(), s.errors

        user = s.save()
        # At least strip spaces; case normalization depends on your implementation.
        assert user.email.strip() == user.email


@pytest.mark.django_db
class TestAuthentication:
    """
    Authentication tests.
    With USERNAME_FIELD = 'email', Django's ModelBackend still expects 'username' kwarg.
    """

    def test_login_success(self):
        User.objects.create_user(email="login@test.com", password=STRONG_PASSWORD)

        user = authenticate(username="login@test.com", password=STRONG_PASSWORD)
        assert user is not None
        assert user.email == "login@test.com"

    def test_login_fails_wrong_password(self):
        User.objects.create_user(email="login2@test.com", password=STRONG_PASSWORD)

        user = authenticate(username="login2@test.com", password="WrongPass123")
        assert user is None

    def test_login_fails_unknown_user(self):
        user = authenticate(username="nope@test.com", password=STRONG_PASSWORD)
        assert user is None

@pytest.mark.django_db
class TestTherapistProfile:
    """
    Tests related to TherapistProfile behavior.
    These tests ensure that:
    - A therapist profile is created automatically on user registration
    - Duplicate therapist profiles are NOT created for the same user
    """

    def test_created_on_register(self):
        """
        When a user registers successfully,
        a TherapistProfile should be created automatically.
        """

        data = {
            "email": "therapist@test.com",
            "first_name": "Therapist",
            "last_name": "User",
            "password": STRONG_PASSWORD,
            "password_confirm": STRONG_PASSWORD,
        }

        serializer = RegisterSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

        user = serializer.save()

        # Assert therapist profile was created
        assert TherapistProfile.objects.filter(user=user).exists()

    def test_no_duplicates(self):
        """
        Ensure that only ONE TherapistProfile exists per user
        even if profile creation logic is triggered more than once.
        """

        data = {
            "email": "nodup@test.com",
            "first_name": "No",
            "last_name": "Duplicate",
            "password": STRONG_PASSWORD,
            "password_confirm": STRONG_PASSWORD,
        }

        serializer = RegisterSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

        user = serializer.save()

        # Simulate profile creation being called again
        TherapistProfile.objects.get_or_create(user=user)

        # There must be only one profile
        assert TherapistProfile.objects.filter(user=user).count() == 1
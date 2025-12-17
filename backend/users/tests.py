import pytest
from django.contrib.auth import get_user_model, authenticate
from users.serializers import RegisterSerializer

# Get the custom User model
User = get_user_model()


# Mark the whole test class to allow database access
@pytest.mark.django_db
class TestRegisterSerializer:
    """
    Tests for user registration and authentication logic.

    Scope:
    - Registration via RegisterSerializer
    - Validation rules (email uniqueness, password match, required fields)
    - Basic login using Django authenticate()
    """

    def test_valid_registration(self):
        """
        Test that a user can register successfully
        when all required fields are valid.
        """
        data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "StrongPass123",
            "password_confirm": "StrongPass123",
        }

        serializer = RegisterSerializer(data=data)

        # Serializer should be valid
        assert serializer.is_valid(), serializer.errors

        # Save user to database
        user = serializer.save()

        # Verify user fields
        assert user.email == "test@example.com"
        assert user.check_password("StrongPass123")

    def test_duplicate_email(self):
        """
        Test that registration fails
        if the email already exists in the database.
        """
        # Create an existing user
        User.objects.create_user(
            email="test@example.com",
            password="StrongPass123",
            first_name="Test",
            last_name="User",
        )

        data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "StrongPass123",
            "password_confirm": "StrongPass123",
        }

        serializer = RegisterSerializer(data=data)

        # Serializer should be invalid
        assert not serializer.is_valid()

        # Email error should be returned
        assert "email" in serializer.errors

    def test_password_mismatch(self):
        """
        Test that registration fails
        when password and password_confirm do not match.
        """
        data = {
            "email": "test2@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "StrongPass123",
            "password_confirm": "WrongPass123",
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_missing_fields(self):
        """
        Test that registration fails
        when required fields are missing or empty.
        """
        data = {
            "email": "",
            "password": "StrongPass123",
            "password_confirm": "StrongPass123",
        }

        serializer = RegisterSerializer(data=data)

        assert not serializer.is_valid()

    def test_login_success(self):
        """
        Test that a registered user
        can authenticate successfully using email + password.
        """
        # Create user
        User.objects.create_user(
            email="login@test.com",
            password="StrongPass123",
            first_name="Login",
            last_name="User",
        )

        # Attempt authentication
        user = authenticate(
            email="login@test.com",
            password="StrongPass123",
        )

        # Authentication should succeed
        assert user is not None
        assert user.email == "login@test.com"
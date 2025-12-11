from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# --------------------------------------------
# Simple UserManager for email authentication
# --------------------------------------------
class UserManager(BaseUserManager):

    # Create normal user
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    # Create superuser (admin)
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


# --------------------------------------------

# Custom User Model using email instead of username
class User(AbstractUser):
    username = None  # remove default username field
    email = models.EmailField(unique=True)

    # keep a role flag only (no specialty/license here)
    is_therapist = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()  # <-- IMPORTANT

    def __str__(self):
        return self.email


class Therapist(User):
    """
    Multi-table inheritance: Therapist subclass of User.
    Therapist holds therapist-specific fields (moved out of User).
    """
    specialty = models.CharField(max_length=255, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    is_licensed = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Therapist"
        verbose_name_plural = "Therapists"

    def __str__(self):
        return f"{self.email} (Therapist)"


class Patient(User):
    """
    Patient subclass — inherits authentication fields from User.
    """
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    medical_history = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patients"

    def __str__(self):
        return f"{self.email} (Patient)"
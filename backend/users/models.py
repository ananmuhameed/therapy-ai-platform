from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.exceptions import ValidationError
from core.models import TimeStampedModel
import uuid
from django.utils import timezone
from datetime import timedelta

# ---------- UserManager / User  ----------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    is_therapist = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


# ---------- TherapistProfile (OneToOne with User) ----------
class TherapistProfile(TimeStampedModel):
    # link to user (one-to-one)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="therapist_profile",
    )

    # fields from your schema
    specialization = models.CharField(max_length=255, blank=True)  # specialization == specialty
    license_number = models.CharField(max_length=100, blank=True)
    years_experience = models.IntegerField(null=True, blank=True)
    clinic_name = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)

    is_completed = models.BooleanField(default=False)

    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Therapist Profile"
        verbose_name_plural = "Therapist Profiles"
        db_table = "therapist_profile"


    def __str__(self):
        return f"{self.user.email} - TherapistProfile"
    
    def clean(self):
        if self.user and not self.user.is_therapist:
            raise ValidationError("User must be a therapist to have a TherapistProfile.")


# ---------- Email Verification Model ----------
class EmailVerification(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

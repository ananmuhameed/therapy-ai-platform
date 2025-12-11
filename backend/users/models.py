from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# ---------- UserManager / User (يبقى كما هو) ----------
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

    is_therapist = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


# ---------- TherapistProfile (OneToOne with User) ----------
class TherapistProfile(models.Model):
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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Therapist Profile"
        verbose_name_plural = "Therapist Profiles"

    def __str__(self):
        return f"{self.user.email} - TherapistProfile"


# ---------- Patient (linked to TherapistProfile) ----------
class Patient(models.Model):
    # Option A: link to therapist profile (recommended)
    therapist = models.ForeignKey(
        TherapistProfile,
        on_delete=models.CASCADE,
        related_name="patients",
    )

    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    contact_email = models.EmailField(max_length=255, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patients"

    def __str__(self):
        return f"{self.full_name} (Patient)"
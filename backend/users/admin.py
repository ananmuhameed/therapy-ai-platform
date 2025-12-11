from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import Therapist, Patient

User = get_user_model()

# Ensure idempotent registration
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ("email", "is_staff", "is_superuser", "is_therapist")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Therapist Info", {"fields": ("is_therapist",)}),  # avoid duplicate fields here
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_superuser"),
        }),
    )


@admin.register(Therapist)
class TherapistAdmin(admin.ModelAdmin):
    # Therapist inherits fields from User, so use those directly.
    list_display = ("email", "first_name", "is_licensed", "specialty")
    search_fields = ("email", "specialty", "license_number")


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "dob")
    search_fields = ("email",)
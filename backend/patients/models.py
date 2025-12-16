from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError



class Patient(models.Model):
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
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
        db_table = "patient"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} (Therapist: {self.therapist_id})"
    def clean(self):
        if self.therapist and not getattr(self.therapist, "is_therapist", False):
            raise ValidationError({"therapist": "Selected user is not a therapist."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

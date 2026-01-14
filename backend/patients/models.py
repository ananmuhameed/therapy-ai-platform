from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from core.models import TimeStampedModel

class Patient(TimeStampedModel):
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patients",
    )

    patient_id = models.CharField(max_length=14, db_index=True)
    full_name = models.CharField(max_length=255)

    gender = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    contact_phone = models.CharField(max_length=30)

    contact_email = models.EmailField(max_length=255, blank=True, null=True, default=None)

    notes = models.TextField(blank=True, default="")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["therapist", "patient_id"],
                name="uniq_patient_id_per_therapist",
            ),
            models.UniqueConstraint(
                fields=["therapist", "contact_phone"],
                name="uniq_patient_phone_per_therapist",
            ),
            models.UniqueConstraint(
                fields=["therapist", "contact_email"],
                condition=Q(contact_email__isnull=False) & ~Q(contact_email=""),
                name="uniq_patient_email_per_therapist",
            )

        ]

    def clean(self):
        if self.therapist and not getattr(self.therapist, "is_therapist", False):
            raise ValidationError({"therapist": "Selected user is not a therapist."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

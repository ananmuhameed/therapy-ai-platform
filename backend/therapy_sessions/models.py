from django.conf import settings
from django.db import models
from patients.models import Patient


class TherapySession(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("recorded", "Recorded"),
        ("transcribed", "Transcribed"),
        ("analyzed", "Analyzed"),
    ]

    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="therapy_sessions",
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="sessions",
    )

    session_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField()

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="scheduled",
    )

    notes_before = models.TextField(blank=True)
    notes_after = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "therapy_session"
        ordering = ["-session_date"]

    def __str__(self):
        return f"Session #{self.id} | Patient {self.patient_id} | {self.session_date}"

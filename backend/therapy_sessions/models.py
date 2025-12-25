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
    
class SessionTranscript(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    session = models.OneToOneField(
        "TherapySession",
        on_delete=models.CASCADE,
        related_name="transcript",
        db_index=True,
    )

    raw_transcript = models.TextField(blank=True)
    cleaned_transcript = models.TextField(blank=True)

    language_code = models.CharField(max_length=10, blank=True)
    word_count = models.PositiveIntegerField(default=0)

    model_name = models.CharField(max_length=100, blank=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="completed",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "session_transcript"

    def __str__(self):
        return f"Transcript | Session #{self.session_id} | {self.status}"
    
class SessionReport(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    session = models.OneToOneField(
        "TherapySession",
        on_delete=models.CASCADE,
        related_name="report",
        db_index=True,
    )

    generated_summary = models.TextField(blank=True)
    key_points = models.TextField(blank=True)
    risk_flags = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    therapist_notes = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft",
    )

    model_name = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "session_report"

    def __str__(self):
        return f"Report | Session #{self.session_id} | {self.status}"


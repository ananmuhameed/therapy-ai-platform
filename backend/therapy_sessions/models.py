from django.conf import settings
from django.db import models
from patients.models import Patient


class TherapySession(models.Model):
    STATUS_CHOICES = [
        ("empty", "Empty"),                 # session created, no audio yet
        ("uploaded", "Uploaded"),           # audio uploaded
        ("recorded", "Recorded"),           # audio recorded in-app
        ("transcribing", "Transcribing"),   # whisper running
        ("analyzing", "Analyzing"),         # LLM running
        ("completed", "Completed"),         # report ready
        ("failed", "Failed"),               # needs user action (upload/replace)
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

    session_date = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="empty",
    )

    last_error_stage = models.CharField(max_length=30, blank=True, default="")   # upload/transcribe/analyze
    last_error_message = models.TextField(blank=True, default="")

    notes_before = models.TextField(blank=True)
    notes_after = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "therapy_session"
        ordering = ["-session_date"]

    def __str__(self):
        return f"Session #{self.id} | Patient {self.patient_id} | {self.session_date}"

class SessionAudio(models.Model):

    session = models.OneToOneField(
        TherapySession,
        on_delete=models.CASCADE,
        related_name="audio", # one-to-one relationship when c
    )
    audio_file = models.FileField(upload_to="recordings/") # path to the file
    original_filename = models.CharField(max_length=255) # original file name uploaded
    
    duration_seconds = models.PositiveIntegerField(null=True, blank=True) # in seconds
    sample_rate = models.PositiveIntegerField(null=True, blank=True) # in Hz
    language_code = models.CharField(max_length=10, null=True, blank=True) 

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audio for Session #{self.session_id}"
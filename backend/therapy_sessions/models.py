from django.conf import settings
from django.db import models
from patients.models import Patient

from core.models import TimeStampedModel

class TherapySession(TimeStampedModel):
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

    class Meta:
        db_table = "therapy_session"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Session #{self.id} | Patient {self.patient_id} | {self.session_date}"

class SessionAudio(TimeStampedModel):

    session = models.OneToOneField(
        TherapySession,
        on_delete=models.CASCADE, # when session is deleted, delete audio too
        related_name="audio", # one-to-one relationship when c
    )

    def session_audio_path(instance, filename):
        return f"recordings/patient_{instance.session.patient_id}/session_{instance.session.id}/{filename}"
    
    audio_file = models.FileField(upload_to=session_audio_path) # path to the file
    original_filename = models.CharField(max_length=255) # original file name uploaded
    
    duration_seconds = models.PositiveIntegerField(null=True, blank=True) # in seconds
    sample_rate = models.PositiveIntegerField(null=True, blank=True) # in Hz
    language_code = models.CharField(max_length=10, null=True, blank=True) 


    def __str__(self):
        return f"Audio for Session #{self.session_id}"    
    
class SessionTranscript(TimeStampedModel):
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

    class Meta:
        db_table = "session_transcript"

    def __str__(self):
        return f"Transcript | Session #{self.session_id} | {self.status}"

class SessionReport(TimeStampedModel):
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

    class Meta:
        db_table = "session_report"

    def __str__(self):
        return f"Report | Session #{self.session_id} | {self.status}"

class SessionAudioUpload(TimeStampedModel):
    session = models.OneToOneField(
        TherapySession,
        on_delete=models.CASCADE, # when session is deleted, delete audio upload too
        related_name="audio_upload", # one-to-one relationship
    )
    s3_key=models.CharField(max_length=1024) # S3 object key
    upload_id = models.CharField(max_length=255) # multipart upload ID
    status = models.CharField(max_length=32, default="uploading") # uploading, completed, aborted, failed

    def __str__(self):
        return f"Multipart Upload for Session #{self.session_id} | Status: {self.status}"
from celery import shared_task
from django.db import transaction
from django.utils import timezone

from .models import SessionTranscript, TherapySession

# TODO: replace these with your real implementations
def run_transcription(audio_file: str, language_code: str | None) -> str:
    # whisper / faster-whisper call here
    return "transcript text (mock)"

def run_analysis(transcript_text: str) -> dict:
    # LLM call here
    return {"summary": "analysis (mock)"}


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,        # exponential backoff
    retry_jitter=True,
    retry_kwargs={"max_retries": 5},
)
def transcribe_session(self, session_id: int):
    try:
        session = TherapySession.objects.select_related("audio").get(id=session_id)

        if not hasattr(session, "audio"):
            # This should not happen if you enqueue after commit
            raise RuntimeError("No audio attached to session.")

        # status is already set to transcribing by API, but keep this safe
        if session.status != "transcribing":
            session.status = "transcribing"
            session.save(update_fields=["status", "updated_at"])

        audio_file = session.audio.audio_file.path  # local storage
        language_code = session.audio.language_code

        transcript_text = run_transcription(audio_file, language_code)

        # TODO: save transcript_text in your SessionTranscript model/table
        # SessionTranscript.objects.update_or_create(session=session, defaults={...})

        session.status = "analyzing"
        session.save(update_fields=["status", "updated_at"])

        # enqueue next step
        analyze_session.delay(session_id)

    except Exception as exc:
        # if this was the last retry, mark failed
        if self.request.retries >= self.max_retries:
            session = TherapySession.objects.get(id=session_id)
            session.status = "failed"
            session.save(update_fields=["status", "updated_at"])
        raise

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 5},
)
def analyze_session(self, session_id: int):
    try:
        session = TherapySession.objects.get(id=session_id)

        # TODO: fetch transcript text from DB
        transcript_text = "transcript text (mock)"

        report = run_analysis(transcript_text)

        # TODO: save report JSON/PDF path in DB
        # SessionReport.objects.update_or_create(session=session, defaults={...})

        session.status = "completed"
        session.save(update_fields=["status", "updated_at"])
        
    except Exception as exc:
        max_retries = getattr(self, "max_retries", 0) or 0
        if self.request.retries >= max_retries:
            TherapySession.objects.filter(id=session_id).update(
                status="failed",
                updated_at=timezone.now(),
            )
        raise
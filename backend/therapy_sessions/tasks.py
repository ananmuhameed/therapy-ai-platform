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

from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from therapy_sessions.models import TherapySession, SessionTranscript
from therapy_sessions.services.transcription import get_transcription_service


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def transcribe_session(self, session_id: int):
    """
    Async: loads session + audio, calls transcription service, persists SessionTranscript.
    Safe for retries + idempotent-ish.
    """
    # 1) Load session
    try:
        session = TherapySession.objects.select_related("audio").get(id=session_id)
    except TherapySession.DoesNotExist:
        return {"ok": False, "error": "session_not_found", "session_id": session_id}

    # 2) Load audio safely (OneToOne can raise RelatedObjectDoesNotExist)
    try:
        audio = session.audio
    except ObjectDoesNotExist:
        return {"ok": False, "error": "no_audio", "session_id": session_id}

    # 3) Upsert transcript row early so UI can show "transcribing"
    transcript, _ = SessionTranscript.objects.get_or_create(
        session=session,
        defaults={
            "status": "transcribing",
            "language_code": (getattr(audio, "language_code", None) or "en"),
        },
    )

    # If already completed, don't re-run (prevents duplicate tasks doing extra work)
    if transcript.status == "completed":
        return {
            "ok": True,
            "skipped": True,
            "reason": "already_completed",
            "session_id": session_id,
            "transcript_id": transcript.id,
        }

    # Ensure status is transcribing
    if transcript.status != "transcribing":
        transcript.status = "transcribing"
        transcript.updated_at = timezone.now()
        transcript.save(update_fields=["status", "updated_at"])

    # 4) Resolve audio path robustly (local path OR storage_path)
    audio_path = (
        getattr(getattr(audio, "audio_file", None), "path", None)
        or getattr(audio, "storage_path", None)
    )
    if not audio_path:
        # Fail fast: better than calling service with ""
        raise RuntimeError("Audio path is missing/unsupported by the current storage backend.")

    language = getattr(audio, "language_code", None) or "en"

    # 5) Transcribe + persist
    try:
        service = get_transcription_service()
        result = service.transcribe(audio_path=audio_path, language=language)

        transcript.raw_transcript = result["raw_text"]
        transcript.cleaned_transcript = result["cleaned_text"]
        transcript.language_code = result["language"]
        transcript.word_count = result["word_count"]
        transcript.model_name = result["model_name"]
        transcript.status = "completed"
        transcript.save()

        return {"ok": True, "session_id": session_id, "transcript_id": transcript.id}

    except Exception as e:
        # Only mark failed on the FINAL attempt; otherwise keep it transcribing/retrying
        if self.request.retries >= self.max_retries:
            transcript.status = "failed"
            transcript.updated_at = timezone.now()
            transcript.save(update_fields=["status", "updated_at"])
            raise
        raise self.retry(exc=e)


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
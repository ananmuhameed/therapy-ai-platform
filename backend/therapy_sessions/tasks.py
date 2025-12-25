# backend/therapy_sessions/tasks.py
from __future__ import annotations

from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone

from therapy_sessions.models import TherapySession, SessionTranscript, SessionReport
from therapy_sessions.services.transcription import get_transcription_service
from therapy_sessions.services.reporting.service import ReportService, ReportGenerationError


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def transcribe_session(self, session_id: int):
    """
    Async: loads session + audio, calls transcription service, persists SessionTranscript.
    Safe for retries + idempotent-ish.
    On success, triggers report generation AFTER transcript commit.
    """
    try:
        session = TherapySession.objects.select_related("audio").get(id=session_id)
    except TherapySession.DoesNotExist:
        return {"ok": False, "error": "session_not_found", "session_id": session_id}

    try:
        audio = session.audio
    except ObjectDoesNotExist:
        return {"ok": False, "error": "no_audio", "session_id": session_id}

    transcript, _ = SessionTranscript.objects.get_or_create(
        session=session,
        defaults={
            "status": "transcribing",
            "language_code": (getattr(audio, "language_code", None) or "en"),
        },
    )

    if transcript.status == "completed":
        return {
            "ok": True,
            "skipped": True,
            "reason": "already_completed",
            "session_id": session_id,
            "transcript_id": transcript.id,
        }

    if transcript.status != "transcribing":
        transcript.status = "transcribing"
        transcript.updated_at = timezone.now()
        transcript.save(update_fields=["status", "updated_at"])

    audio_path = (
        getattr(getattr(audio, "audio_file", None), "path", None)
        or getattr(audio, "storage_path", None)
    )
    if not audio_path:
        # will retry; on final retry we mark failed below
        raise RuntimeError("Audio path is missing/unsupported by the current storage backend.")

    language = getattr(audio, "language_code", None) or "en"

    try:
        service = get_transcription_service()
        result = service.transcribe(audio_path=audio_path, language=language)

        # Ensure commit happens before we enqueue the next task
        with transaction.atomic():
            transcript.raw_transcript = result["raw_text"]
            transcript.cleaned_transcript = result["cleaned_text"]
            transcript.language_code = result["language"]
            transcript.word_count = result["word_count"]
            transcript.model_name = result["model_name"]
            transcript.status = "completed"
            transcript.updated_at = timezone.now()
            transcript.save()

            transaction.on_commit(lambda: generate_session_report.delay(session_id))

        return {"ok": True, "session_id": session_id, "transcript_id": transcript.id}

    except Exception as e:
        # mark failed only on FINAL attempt
        if self.request.retries >= self.max_retries:
            transcript.status = "failed"
            transcript.updated_at = timezone.now()
            transcript.save(update_fields=["status", "updated_at"])
            raise
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def generate_session_report(self, session_id: int):
    """
    - Business errors (ReportGenerationError) => mark failed and STOP (no retry)
    - Unexpected errors => mark failed and retry
    """
    try:
        report = ReportService.generate_for_session(session_id)

        if report.status != "completed":
            report.status = "completed"
            report.save(update_fields=["status"])

        return {"ok": True, "session_id": session_id, "report_id": report.id}

    except ReportGenerationError as e:
        # Ensure a report exists, then mark failed (no retries)
        SessionReport.objects.get_or_create(
            session_id=session_id,
            defaults={"status": "failed", "model_name": "mock-v1"},
        )
        SessionReport.objects.filter(session_id=session_id).update(status="failed")
        return {
            "ok": False,
            "error": "report_generation_error",
            "detail": str(e),
            "session_id": session_id,
        }

    except Exception as e:
        # Ensure a report exists, then mark failed and retry
        SessionReport.objects.get_or_create(
            session_id=session_id,
            defaults={"status": "failed", "model_name": "unknown"},
        )
        SessionReport.objects.filter(session_id=session_id).update(status="failed")

        if self.request.retries >= self.max_retries:
            raise
        raise self.retry(exc=e)

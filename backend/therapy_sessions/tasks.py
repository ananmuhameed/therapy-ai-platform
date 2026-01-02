# backend/therapy_sessions/tasks.py
from __future__ import annotations

from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone

from therapy_sessions.models import TherapySession, SessionTranscript, SessionReport
from therapy_sessions.services.transcription import get_transcription_service
from therapy_sessions.services.reporting.service import ReportService, ReportGenerationError

import os
import tempfile
from django.core.files.storage import default_storage


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def transcribe_session(self, session_id: int):
    """
    Async: loads session + audio, calls transcription service, persists SessionTranscript.
    Safe for retries + idempotent-ish.
    On success, triggers report generation AFTER transcript commit.
    """
    audio_path = None # avoid reference before assignment if failure occurs early

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

    audio_name = getattr(getattr(audio, "audio_file", None), "name", None)
    if not audio_name:
        raise RuntimeError("Audio file name/key missing.")

    suffix = ""
    if "." in audio_name:
        suffix = "." + audio_name.rsplit(".", 1)[1].lower()

    with default_storage.open(audio_name, "rb") as src:
        with tempfile.NamedTemporaryFile(suffix=suffix or ".webm", delete=False) as tmp:
            for chunk in iter(lambda: src.read(1024 * 1024), b""):
                tmp.write(chunk)
            audio_path = tmp.name

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
            TherapySession.objects.filter(id=session_id).update(
            last_error_stage="transcription",
            last_error_message=str(e)[:500],
            status="failed",
            updated_at=timezone.now(),
        )

            raise
        raise self.retry(exc=e)
    finally:
        try:
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception:
            pass


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def generate_session_report(self, session_id: int):
    """
    - Business errors (ReportGenerationError): mark failed and STOP (no retry)
    - Unexpected errors: retry; only mark failed on FINAL attempt
    - Keeps status truthful: processing -> completed/failed
    """
    # Ensure a report exists and mark as processing up front
    report, _ = SessionReport.objects.get_or_create(
        session_id=session_id,
        defaults={"status": "processing", "model_name": "unknown"},
    )

    if report.status != "processing":
        SessionReport.objects.filter(session_id=session_id).update(
            status="processing",
            updated_at=timezone.now(),
        )

    try:
        # Your service should read transcript from DB (not audio path)
        report = ReportService.generate_for_session(session_id)

        if report.status != "completed":
            report.status = "completed"
            report.updated_at = timezone.now()
            report.save(update_fields=["status", "updated_at"])

        return {"ok": True, "session_id": session_id, "report_id": report.id}

    except ReportGenerationError as e:
        # Business failure: do NOT retry
        SessionReport.objects.filter(session_id=session_id).update(
            status="failed",
            updated_at=timezone.now(),
        )
        return {
            "ok": False,
            "error": "report_generation_error",
            "detail": str(e),
            "session_id": session_id,
        }

    except Exception as e:
        # Unexpected failure: retry; only mark failed on final attempt
        if self.request.retries >= self.max_retries:
            SessionReport.objects.filter(session_id=session_id).update(
                status="failed",
                updated_at=timezone.now(),
            )
            raise

        # Keep it as processing while retries are happening
        raise self.retry(exc=e)
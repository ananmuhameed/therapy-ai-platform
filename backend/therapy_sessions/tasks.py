from __future__ import annotations

from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone

from therapy_sessions.models import TherapySession, SessionTranscript, SessionReport
from therapy_sessions.services.transcription.whisper import WhisperTranscriptionService
from therapy_sessions.services.reporting.service import ReportService, ReportGenerationError

import os
import tempfile
from django.core.files.storage import default_storage


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def transcribe_session(self, session_id: int):
    audio_path = None

    try:
        session = TherapySession.objects.select_related("audio").get(id=session_id)
    except TherapySession.DoesNotExist:
        return {"ok": False, "error": "session_not_found", "session_id": session_id}

    try:
        audio = session.audio
    except ObjectDoesNotExist:
        if session.status != "failed":
            session.status = "failed"
            session.updated_at = timezone.now()
            session.save(update_fields=["status", "updated_at"])
        return {"ok": False, "error": "no_audio", "session_id": session_id}

    # move forward only (no state regression)
    if session.status in {"scheduled", "recorded"}:
        session.status = "transcribing"
        session.updated_at = timezone.now()
        session.save(update_fields=["status", "updated_at"])

    transcript, _ = SessionTranscript.objects.get_or_create(
        session=session,
        defaults={
            "status": "transcribing",
            "language_code": getattr(audio, "language_code", None) or "ar",
        },
    )

    if transcript.status == "completed":
        report = SessionReport.objects.filter(session=session).only("status").first()

        # if transcript done but report missing / not completed -> enqueue report generation
        if not report or report.status != "completed":
            if session.status != "analyzing":
                session.status = "analyzing"
                session.updated_at = timezone.now()
                session.save(update_fields=["status", "updated_at"])
            transaction.on_commit(lambda: generate_session_report.delay(session_id))
        else:
            if session.status != "completed":
                session.status = "completed"
                session.updated_at = timezone.now()
                session.save(update_fields=["status", "updated_at"])

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

    suffix = "." + audio_name.rsplit(".", 1)[1].lower() if "." in audio_name else ".webm"

    with default_storage.open(audio_name, "rb") as src:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            for chunk in iter(lambda: src.read(1024 * 1024), b""):
                tmp.write(chunk)
            audio_path = tmp.name

    language = getattr(audio, "language_code", None) or "ar"

    try:
        transcription_service = WhisperTranscriptionService()
        result = transcription_service.transcribe(
            audio_path=audio_path,
            language=language,
        )

        with transaction.atomic():
            transcript.raw_transcript = result["raw_text"]
            transcript.cleaned_transcript = result["cleaned_text"]
            transcript.language_code = language
            transcript.word_count = result["word_count"]
            transcript.model_name = result["model_name"]
            transcript.status = "completed"
            transcript.updated_at = timezone.now()
            transcript.save()

            session.status = "transcribed"
            session.updated_at = timezone.now()
            session.save(update_fields=["status", "updated_at"])

            transaction.on_commit(lambda: generate_session_report.delay(session_id))

        return {"ok": True, "session_id": session_id, "transcript_id": transcript.id}

    except Exception as e:
        if self.request.retries >= self.max_retries:
            with transaction.atomic():
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

    finally:
        try:
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception:
            pass

    finally:
        try:
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception:
            pass


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def generate_session_report(self, session_id: int):
    # idempotency guard
    existing = SessionReport.objects.filter(session_id=session_id).first()
    if existing and existing.status == "completed":
        return {
            "ok": True,
            "skipped": True,
            "reason": "already_completed",
            "session_id": session_id,
            "report_id": existing.id,
        }

    report, _ = SessionReport.objects.get_or_create(
        session_id=session_id,
        defaults={"status": "processing", "model_name": "unknown"},
    )

    SessionReport.objects.filter(
        session_id=session_id,
        status__in=["draft", "failed"],  # allow rerun only from these
    ).update(
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

        TherapySession.objects.filter(id=session_id).update(
            status="completed",
            updated_at=timezone.now(),
        )

        return {"ok": True, "session_id": session_id, "report_id": report.id}

    except ReportGenerationError as e:
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
        if self.request.retries >= self.max_retries:
            SessionReport.objects.filter(session_id=session_id).update(
                status="failed",
                updated_at=timezone.now(),
            )
            raise

        raise self.retry(exc=e)

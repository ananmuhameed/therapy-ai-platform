from __future__ import annotations

from dataclasses import asdict
from typing import Any, Dict

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from therapy_sessions.models import TherapySession, SessionTranscript, SessionReport

from .base import BaseReportProvider, GeneratedReport
from .llm import OpenAIReportProvider
from .mock import MockReportProvider


class ReportGenerationError(Exception):
    """Business-level error: do not retry (e.g. missing transcript)."""


def get_report_provider() -> BaseReportProvider:
    """
    Central place to select report provider.
    """
    if getattr(settings, "USE_MOCK_AI", False):
        return MockReportProvider()
    return OpenAIReportProvider()


class ReportService:
    @staticmethod
    def generate_for_session(session_id: int) -> SessionReport:
        """
        Loads transcript for session_id, calls provider, saves SessionReport.
        Raises ReportGenerationError for business failures.
        """
        try:
            session = TherapySession.objects.get(id=session_id)
        except TherapySession.DoesNotExist:
            raise ReportGenerationError("session_not_found")

        transcript = SessionTranscript.objects.filter(session_id=session_id).first()
        if not transcript:
            raise ReportGenerationError("missing_transcript")

        if transcript.status != "completed":
            raise ReportGenerationError("transcript_not_completed")

        provider = get_report_provider()

        generated: GeneratedReport = provider.generate(
            transcript_text=transcript.cleaned_transcript or transcript.raw_transcript or "",
            session_context={"session_id": session_id},
            language=transcript.language_code or "en",
        )

        # Persist report
        with transaction.atomic():
            report, _ = SessionReport.objects.get_or_create(
                session_id=session_id,
                defaults={"status": "processing", "model_name": generated.model_name},
            )

            # Map GeneratedReport -> SessionReport fields
            # (Assumes these fields exist in your model)
            report.generated_summary = generated.summary
            report.key_points = generated.key_points
            report.risk_flags = generated.risk_flags
            report.treatment_plan = generated.treatment_plan
            report.model_name = generated.model_name
            report.status = "completed"
            report.updated_at = timezone.now()
            report.save()

        return report

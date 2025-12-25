# backend/therapy_sessions/services/reporting/service.py
from __future__ import annotations

import json
from typing import Any, Dict, Optional

from django.db import transaction

from therapy_sessions.models import TherapySession, SessionTranscript, SessionReport
from . import get_report_provider


class ReportGenerationError(Exception):
    pass


def _json_dump(value: Any) -> str:
    """
    Serialize python objects to JSON for TextField storage.
    Keep it deterministic and UTF-8 friendly.
    """
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


class ReportService:
    @staticmethod
    @transaction.atomic
    def generate_for_session(session_id: int, *, force: bool = False) -> SessionReport:
        """
        Orchestrates report generation:
        - validates transcript readiness
        - calls selected provider
        - upserts SessionReport
        - NEVER overwrites therapist_notes
        - safe under concurrency
        """
        # 1) lock the session row to avoid concurrent generation for the same session
        session = TherapySession.objects.select_for_update().get(id=session_id)

        # 2) transcript must be ready
        transcript = SessionTranscript.objects.filter(session_id=session_id).first()
        if not transcript or transcript.status != "completed":
            raise ReportGenerationError("Transcript not ready; cannot generate report.")

        text = (transcript.cleaned_transcript or transcript.raw_transcript or "").strip()
        if not text:
            raise ReportGenerationError("Transcript is empty; cannot generate report.")

        # 3) lock or create the report row in a concurrency-safe way
        report_qs = SessionReport.objects.select_for_update().filter(session=session)
        report = report_qs.first()

        if report and (report.status == "completed") and not force:
            # completed reports are treated as final unless force regeneration is requested
            return report

        # 4) generate
        provider = get_report_provider()
        generated = provider.generate(transcript_text=text)

        # 5) serialize structured fields into TextFields
        key_points_txt = _json_dump(generated.key_points)
        risk_flags_txt = _json_dump(generated.risk_flags)
        treatment_plan_txt = _json_dump(generated.treatment_plan)

        if not report:
            report = SessionReport.objects.create(
                session=session,
                generated_summary=generated.summary,
                key_points=key_points_txt,
                risk_flags=risk_flags_txt,
                treatment_plan=treatment_plan_txt,
                status="draft",
                model_name=generated.model_name,
            )
            return report

        # update existing (preserve therapist_notes)
        report.generated_summary = generated.summary
        report.key_points = key_points_txt
        report.risk_flags = risk_flags_txt
        report.treatment_plan = treatment_plan_txt
        report.model_name = generated.model_name

        # if it previously failed, bring it back to draft on successful regen
        if report.status == "failed":
            report.status = "draft"

        report.save(
            update_fields=[
                "generated_summary",
                "key_points",
                "risk_flags",
                "treatment_plan",
                "model_name",
                "status",
            ]
        )
        return report

# backend/therapy_sessions/services/reporting/mock.py
from __future__ import annotations

from typing import Any, Dict, Optional

from .base import BaseReportProvider, GeneratedReport


class MockReportProvider(BaseReportProvider):
    """
    Deterministic provider for Sprint 3:
    - stable output for tests/CI
    - zero external dependencies
    """

    def generate(
        self,
        *,
        transcript_text: str,
        session_context: Optional[Dict[str, Any]] = None,
        language: str = "en",
    ) -> GeneratedReport:
        text = (transcript_text or "").strip()

        if not text:
            return GeneratedReport(
                summary="No transcript content available.",
                key_points=["—"],
                risk_flags=[
                    {
                        "type": "insufficient_transcript",
                        "severity": "low",
                        "evidence": "Transcript is empty or missing.",
                    }
                ],
                treatment_plan=["Follow-up next session; gather more detail."],
                model_name="mock-v1",
            )

        lower = text.lower()

        # deterministic "risk scan"
        risk_terms = ["suicide", "self-harm", "kill myself", "die", "hopeless"]
        hits = sorted({kw for kw in risk_terms if kw in lower})

        risk_flags = []
        for kw in hits:
            risk_flags.append(
                {
                    "type": "risk_keyword",
                    "severity": "high" if kw in ("suicide", "kill myself", "self-harm") else "medium",
                    "evidence": kw,
                }
            )

        # deterministic summary
        summary = text[:600] + ("…" if len(text) > 600 else "")

        # deterministic key points
        # crude but stable: split by '.' after flattening newlines
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
        bullets = sentences[:5] if sentences else [text[:120]]
        key_points = bullets

        treatment_plan = [
            "Identify primary stressors mentioned",
            "Track mood/trigger patterns until next session",
            "Agree on 1–2 coping strategies to practice daily",
        ]

        return GeneratedReport(
            summary=summary,
            key_points=key_points,
            risk_flags=risk_flags,
            treatment_plan=treatment_plan,
            model_name="mock-v1",
            raw={"language": language, "context_keys": sorted((session_context or {}).keys())},
        )

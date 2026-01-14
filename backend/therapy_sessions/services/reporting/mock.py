from typing import Dict, Any, Optional

from .base import BaseReportProvider, GeneratedReport


class MockReportProvider(BaseReportProvider):
    def generate(
        self,
        *,
        transcript_text: str,
        session_context: Optional[Dict[str, Any]] = None,
        language: str = "en",
    ) -> GeneratedReport:

        return GeneratedReport(
            summary="Mock summary for testing.",
            key_points=["Mock key point"],
            risk_flags=[],
            treatment_plan=["Mock treatment plan"],
            model_name="mock",
            raw={"source": "mock"},
        )

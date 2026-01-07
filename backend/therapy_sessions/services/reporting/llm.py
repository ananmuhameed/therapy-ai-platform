from typing import Dict, Any, Optional

from django.conf import settings
from openai import OpenAI

from .base import BaseReportProvider, GeneratedReport
from .schema import ReportSchema


class OpenAIReportProvider(BaseReportProvider):
    MODEL = "gpt-4.1-mini"

    def __init__(self):
        self._client: Optional[OpenAI] = None

    def _get_client(self) -> OpenAI:
        if self._client:
            return self._client

        api_key = getattr(settings, "OPENAI_API_KEY", None)
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY is not set. "
                "Use MockReportProvider in tests or set USE_MOCK_AI=True."
            )

        self._client = OpenAI(api_key=api_key)
        return self._client

    def generate(
        self,
        *,
        transcript_text: str,
        session_context: Optional[Dict[str, Any]] = None,
        language: str = "ar",
    ) -> GeneratedReport:

        if not transcript_text.strip():
            raise ValueError("Transcript text is empty; cannot generate report.")

        client = self._get_client()

        response = client.responses.parse(
            model=self.MODEL,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a clinical assistant generating structured therapy reports. "
                        "Return ONLY valid JSON matching the schema. "
                        "Be concise, factual, and clinically neutral. "
                        "ALWAYS assess suicide and self-harm risk. "
                        "IF the transcript contains suicidal ideation, intent, or desire to die, "
                        "you MUST include at least one item in risk_flags with severity = high. "
                        "key_points MUST NOT be empty. "
                        "key_points must be specific and grounded in the transcript "
                        "(use concrete themes or events). Provide 4–8 bullet items. "
                        "treatment_plan MUST NOT be empty. "
                        "treatment_plan must be actionable and session-specific. "
                        "Provide 3–6 items. If high risk is detected, include immediate safety steps."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Language: {language}\n"
                        f"Context: {session_context or {}}\n\n"
                        f"Transcript:\n{transcript_text}"
                    ),
                },
            ],
            text_format=ReportSchema,
        )

        parsed: ReportSchema = response.output_parsed

        return GeneratedReport(
            summary=parsed.summary,
            key_points=parsed.key_points,
            risk_flags=[rf.dict() for rf in parsed.risk_flags],
            treatment_plan=parsed.treatment_plan,
            model_name=self.MODEL,
            raw=response.model_dump(),
        )
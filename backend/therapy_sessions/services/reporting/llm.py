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

                        "LANGUAGE POLICY: Write all narrative text in Arabic. "
                        "You MAY keep essential English terms (e.g., diagnosis names, medications, CBT/DBT terms, "
                        "assessment scales, proper nouns, product/app names) exactly in English when appropriate. "
                        "Do NOT translate or transliterate those essential terms. "
                        "Outside of those terms, avoid English sentences. "

                        "Keys remain exactly as required by the schema; only VALUES are written. "

                        "Be concise, factual, and clinically neutral. "
                        "ALWAYS assess suicide and self-harm risk. "
                        "IF the transcript contains suicidal ideation, intent, or desire to die, "
                        "you MUST include at least one item in risk_flags with severity = high. "
                        "key_points MUST NOT be empty. "
                        "key_points must be specific and grounded in the transcript (concrete themes/events). "
                        "Provide 4–8 bullet items. "
                        "treatment_plan MUST NOT be empty and must be actionable and session-specific. "
                        "Provide 3–6 items. If high risk is detected, include immediate safety steps."
                    )
                    },
                {
                    "role": "user",
                    "content": (
                        f"Output language MUST be Arabic (ar). Use Arabic script only.\n"
                        f"Language: ar\n"
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
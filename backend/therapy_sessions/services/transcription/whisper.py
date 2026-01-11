import os
import re
from typing import Dict, Optional

from django.conf import settings
from openai import OpenAI

from .base import BaseTranscriptionService, validate_transcription_output


def _basic_clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


class WhisperTranscriptionService(BaseTranscriptionService):
    def __init__(self):
        # Don't create client here (tests/CI may not have OPENAI_API_KEY)
        self._client: Optional[OpenAI] = None

    def _get_client(self) -> OpenAI:
        if self._client:
            return self._client

        api_key = getattr(settings, "OPENAI_API_KEY", None) or os.getenv("OPENAI_API_KEY")
        if not api_key:
            # clearer error + doesn't explode at import/init time
            raise ValueError(
                "OPENAI_API_KEY is not set. "
                "Set it in env or settings, or mock transcription in tests."
            )

        self._client = OpenAI(api_key=api_key)
        return self._client

    def transcribe(self, audio_path: str, language: str = "ar") -> Dict:
        if not audio_path:
            raise ValueError("audio_path is required")

        language = (language or "en").strip() or "en"

        client = self._get_client()

        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ar",
            )

        raw_text = (response.text or "").strip()
        cleaned_text = _basic_clean(raw_text)

        result = {
            "raw_text": raw_text,
            "cleaned_text": cleaned_text,
            "language": getattr(response, "language", None) or language,
            "word_count": len(cleaned_text.split()) if cleaned_text else 0,
            "model_name": "whisper-1",
        }

        validate_transcription_output(result)
        return result

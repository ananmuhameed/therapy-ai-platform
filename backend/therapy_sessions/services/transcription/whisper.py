import os
import re
from typing import Dict

from django.conf import settings
from openai import OpenAI

from .base import BaseTranscriptionService, validate_transcription_output


def _env(name: str, default: str) -> str:
    """Safe env reader: never returns None or empty."""
    return (os.getenv(name) or default).strip() or default


def _basic_clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


class WhisperTranscriptionService(BaseTranscriptionService):
    def __init__(self):
        # OpenAI Python SDK v1.x uses a client instance
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def transcribe(self, audio_path: str, language: str = "en") -> Dict:
        """Transcribe the given audio file using OpenAI Whisper."""
        if not audio_path:
            raise ValueError("audio_path is required")

        language = (language or "en").strip() or "en"

        try:
            with open(audio_path, "rb") as audio_file:
                response = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                )

            # SDK v1.x returns an object, not a dict
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

        except Exception as e:
            raise ValueError(f"Error in transcription: {str(e)}")

import os
import re
from typing import Dict
import openai
from django.conf import settings


from .base import BaseTranscriptionService, validate_transcription_output


def _env(name: str, default: str) -> str:
    """Safe env reader: never returns None or empty."""
    return (os.getenv(name) or default).strip() or default


def _basic_clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


class WhisperTranscriptionService(BaseTranscriptionService):

    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    def transcribe(self, audio_path: str, language: str = "ar") -> Dict:
        if not audio_path:
            raise ValueError("audio_path is required")

        language = (language or "ar").strip() or "ar"

        try:
            # Open the audio file and send it to OpenAI's API for transcription
            with open(audio_path, 'rb') as audio_file:
                response = openai.Audio.transcribe(
                    model="whisper-1",  # This is the OpenAI Whisper model
                    file=audio_file,
                    language=language
                )

            raw_text = response['text'].strip()
            cleaned_text = _basic_clean(raw_text)

            result = {
                "raw_text": raw_text,
                "cleaned_text": cleaned_text,
                "language": response.get('language', language),
                "word_count": len(cleaned_text.split()) if cleaned_text else 0,
                "model_name": "openai-whisper",
            }

            validate_transcription_output(result)
            return result

        except Exception as e:
            raise ValueError(f"Error in transcription: {str(e)}")

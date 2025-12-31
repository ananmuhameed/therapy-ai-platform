import os
from .base import BaseTranscriptionService

def get_transcription_service() -> BaseTranscriptionService:
    provider = os.getenv("TRANSCRIPTION_PROVIDER", "whisper").lower()

    if provider == "whisper":
        from .whisper import WhisperTranscriptionService
        return WhisperTranscriptionService(
            model_size=os.getenv("WHISPER_MODEL_SIZE", "medium")
        )

    from .mock import MockTranscriptionService
    return MockTranscriptionService()

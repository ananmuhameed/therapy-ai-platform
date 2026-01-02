import os
from .base import BaseTranscriptionService

def get_transcription_service() -> BaseTranscriptionService:
    provider = os.getenv("TRANSCRIPTION_PROVIDER").lower()

    if provider == "whisper":
        from .whisper import WhisperTranscriptionService
        return WhisperTranscriptionService(
            model_size=os.getenv("WHISPER_MODEL_SIZE")
        )

    from .mock import MockTranscriptionService
    return MockTranscriptionService()

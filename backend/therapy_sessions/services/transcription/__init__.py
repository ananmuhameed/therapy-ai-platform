import os
from .base import BaseTranscriptionService

def get_transcription_service() -> BaseTranscriptionService:
    """
    Returns the configured transcription service.
    TRANSCRIPTION_PROVIDER: whisper | mock
    """
    provider = (os.getenv("TRANSCRIPTION_PROVIDER") or "mock").strip().lower()

    if provider == "whisper":
        from .whisper import WhisperTranscriptionService
        return WhisperTranscriptionService()

    from .mock import MockTranscriptionService
    return MockTranscriptionService()

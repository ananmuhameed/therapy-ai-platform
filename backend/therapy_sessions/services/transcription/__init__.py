from .mock import MockTranscriptionService

def get_transcription_service():
    # later: switch by env var
    return MockTranscriptionService()


#later 
#if settings.TRANSCRIBER == "whisper":
#    return WhisperTranscriptionService()

from django.core.management.base import BaseCommand
from therapy_sessions.services.transcription import get_transcription_service

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        service = get_transcription_service()
        result = service.transcribe(
            audio_path="/media/test.wav",
            language="en"
        )
        self.stdout.write(str(result))

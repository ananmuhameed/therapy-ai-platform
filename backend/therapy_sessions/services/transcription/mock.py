# from .base import BaseTranscriptionService, validate_transcription_output


# class MockTranscriptionService(BaseTranscriptionService):
#     def transcribe(self, audio_path: str, language: str) -> dict:
#         result = {
#             "raw_text": "Patient reports feeling anxious...",
#             "cleaned_text": "patient reports feeling anxious...",
#             "language": language,
#             "word_count": 14,
#             "model_name": "mock-transcriber-v1",
#         }

#         validate_transcription_output(result)
#         return result

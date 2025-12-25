from abc import ABC, abstractmethod
from typing import Dict

REQUIRED_TRANSCRIPTION_KEYS = {
    "raw_text",
    "cleaned_text",
    "language",
    "word_count",
    "model_name",
}


def validate_transcription_output(result: Dict):
    missing = REQUIRED_TRANSCRIPTION_KEYS - result.keys()
    if missing:
        raise ValueError(
            f"Invalid transcription output. Missing keys: {missing}"
        )


class BaseTranscriptionService(ABC):
    @abstractmethod
    def transcribe(self, audio_path: str, language: str) -> Dict:
        """
        Must return:
        {
            "raw_text": str,
            "cleaned_text": str,
            "language": str,
            "word_count": int,
            "model_name": str
        }
        """
        raise NotImplementedError

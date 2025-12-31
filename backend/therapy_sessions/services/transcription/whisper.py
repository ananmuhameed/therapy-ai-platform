import re
from typing import Dict, Optional

from faster_whisper import WhisperModel

from .base import BaseTranscriptionService, validate_transcription_output


def _basic_clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


class WhisperTranscriptionService(BaseTranscriptionService):
    """
    faster-whisper implementation (CTranslate2) behind the same interface.
    Keeps the same class name so existing imports don't change.
    """

    def __init__(self, model_size: str = "medium", device: Optional[str] = None):
        self.model_size = model_size
        self.device = device or "cpu"
        self.model = WhisperModel(
                    model_size,
                    device=self.device,
                    compute_type="float16"
                )
    def transcribe(self, audio_path: str, language: str = "ar") -> Dict:
        if not audio_path:
            raise ValueError("audio_path is required")
        if not language:
            language = "ar"

        segments, info = self.model.transcribe(
            audio_path,
            language=language,
        )


        raw_text = " ".join(seg.text.strip() for seg in segments).strip()
        cleaned_text = _basic_clean(raw_text)

        result = {
            "raw_text": raw_text,
            "cleaned_text": cleaned_text,
            "language": (getattr(info, "language", None) or language),
            "word_count": len(cleaned_text.split()) if cleaned_text else 0,
            "model_name": f"faster-whisper-{self.model_size}",
        }
        validate_transcription_output(result)
        return result

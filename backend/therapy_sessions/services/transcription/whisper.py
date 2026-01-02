import os
import re
from typing import Dict

from faster_whisper import WhisperModel

from .base import BaseTranscriptionService, validate_transcription_output


def _env(name: str, default: str) -> str:
    """Safe env reader: never returns None or empty."""
    return (os.getenv(name) or default).strip() or default


def _basic_clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


class WhisperTranscriptionService(BaseTranscriptionService):
    """
    faster-whisper implementation.

    Env vars:
      WHISPER_MODEL_SIZE   = small | medium | large-v3 | <local_path>
      WHISPER_DEVICE       = cpu | cuda
      WHISPER_COMPUTE_TYPE = int8 | float16 | int8_float16
      WHISPER_CACHE_DIR    = /root/.cache/huggingface (optional)
    """

    def __init__(self):
        self.model_size = _env("WHISPER_MODEL_SIZE", "small")
        self.device = _env("WHISPER_DEVICE", "cpu")

        # Safe default per device
        default_compute = "float16" if self.device == "cuda" else "int8"
        self.compute_type = _env("WHISPER_COMPUTE_TYPE", default_compute)

        # Optional: where HF downloads/cache go
        cache_dir = (os.getenv("WHISPER_CACHE_DIR") or "").strip() or None

        # If user accidentally sets float16 on cpu, force a safe fallback
        if self.device == "cpu" and self.compute_type == "float16":
            self.compute_type = "int8"

        self.model = WhisperModel(
            self.model_size,
            device=self.device,
            compute_type=self.compute_type,
            download_root=cache_dir,  # None is fine
        )

    def transcribe(self, audio_path: str, language: str = "ar") -> Dict:
        if not audio_path:
            raise ValueError("audio_path is required")

        language = (language or "ar").strip() or "ar"

        segments, info = self.model.transcribe(
            audio_path,
            language=language,
        )

        raw_text = " ".join((seg.text or "").strip() for seg in segments).strip()
        cleaned_text = _basic_clean(raw_text)

        result = {
            "raw_text": raw_text,
            "cleaned_text": cleaned_text,
            "language": getattr(info, "language", None) or language,
            "word_count": len(cleaned_text.split()) if cleaned_text else 0,
            "model_name": f"faster-whisper-{self.model_size}",
        }

        validate_transcription_output(result)
        return result

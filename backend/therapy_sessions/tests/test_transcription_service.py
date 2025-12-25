# backend/therapy_sessions/tests/test_transcription_service.py
import pytest

from therapy_sessions.services.transcription import get_transcription_service


@pytest.mark.django_db
def test_mock_transcription_service_contract():
    service = get_transcription_service()
    result = service.transcribe(audio_path="/tmp/fake.wav", language="en")

    # Contract keys
    assert isinstance(result, dict)
    assert "raw_text" in result
    assert "cleaned_text" in result
    assert "language" in result
    assert "word_count" in result
    assert "model_name" in result

    # Types
    assert isinstance(result["raw_text"], str)
    assert isinstance(result["cleaned_text"], str)
    assert isinstance(result["language"], str)
    assert isinstance(result["word_count"], int)
    assert isinstance(result["model_name"], str)

    # Basic sanity
    assert result["language"] == "en"
    assert result["word_count"] > 0

import pytest

from therapy_sessions.models import SessionTranscript
from therapy_sessions.tasks import transcribe_session


@pytest.mark.django_db
def test_transcribe_session_creates_transcript_completed(session_a_with_audio):
    session = session_a_with_audio

    result = transcribe_session(session.id)

    assert result["ok"] is True
    transcript = SessionTranscript.objects.get(session=session)

    assert transcript.status == "completed"
    assert transcript.word_count > 0
    assert transcript.model_name
    assert transcript.raw_transcript
    assert transcript.cleaned_transcript


@pytest.mark.django_db
def test_transcribe_session_no_audio_returns_error(session_a):
    result = transcribe_session(session_a.id)

    assert result["ok"] is False
    assert result["error"] == "no_audio"
    assert SessionTranscript.objects.filter(session=session_a).count() == 0


@pytest.mark.django_db
def test_transcribe_session_skips_if_already_completed(session_a_with_audio):
    session = session_a_with_audio

    # First run creates completed transcript
    r1 = transcribe_session(session.id)
    assert r1["ok"] is True

    # Second run should skip
    r2 = transcribe_session(session.id)
    assert r2["ok"] is True
    assert r2.get("skipped") is True
    assert r2.get("reason") == "already_completed"

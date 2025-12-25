import pytest
from unittest.mock import patch

from django.db import transaction
from therapy_sessions.models import SessionAudio

API = "/api/v1"
BASE = f"{API}/sessions"


def _force_on_commit_to_run_immediately():
    """
    Patch transaction.on_commit so callbacks run instantly during tests.
    """
    def _immediate(cb):
        cb()
    return patch.object(transaction, "on_commit", side_effect=_immediate)


@pytest.mark.django_db
def test_upload_audio_success_enqueues_task(auth_client_a, session_a, make_audio_file):
    url = f"{BASE}/{session_a.id}/upload-audio/"

    with _force_on_commit_to_run_immediately(), patch("therapy_sessions.tasks.transcribe_session.delay") as delay_mock:
        resp = auth_client_a.post(
            url,
            data={"audio_file": make_audio_file(), "language_code": "en"},
            format="multipart",
        )

    assert resp.status_code == 201
    assert SessionAudio.objects.filter(session=session_a).count() == 1
    delay_mock.assert_called_once_with(session_a.id)

    session_a.refresh_from_db()
    assert session_a.status == "transcribing"


@pytest.mark.django_db
def test_upload_audio_twice_returns_409(auth_client_a, session_a, make_audio_file):
    url = f"{BASE}/{session_a.id}/upload-audio/"

    with _force_on_commit_to_run_immediately(), patch("therapy_sessions.tasks.transcribe_session.delay") as delay_mock:
        r1 = auth_client_a.post(
            url,
            data={"audio_file": make_audio_file(), "language_code": "en"},
            format="multipart",
        )
        r2 = auth_client_a.post(
            url,
            data={"audio_file": make_audio_file(), "language_code": "en"},
            format="multipart",
        )

    assert r1.status_code == 201
    assert r2.status_code == 409
    assert delay_mock.call_count == 1


@pytest.mark.django_db
def test_replace_audio_success_enqueues_task(auth_client_a, session_a_with_audio, make_audio_file):
    session = session_a_with_audio
    url = f"{BASE}/{session.id}/replace-audio/"

    old_audio_id = SessionAudio.objects.get(session=session).id

    with _force_on_commit_to_run_immediately(), patch("therapy_sessions.tasks.transcribe_session.delay") as delay_mock:
        resp = auth_client_a.post(
            url,
            data={"audio_file": make_audio_file(), "language_code": "en"},
            format="multipart",
        )

    assert resp.status_code == 200

    new_audio = SessionAudio.objects.get(session=session)
    assert new_audio.id != old_audio_id

    delay_mock.assert_called_once_with(session.id)

    session.refresh_from_db()
    assert session.status == "transcribing"


@pytest.mark.django_db
def test_replace_audio_without_existing_audio_returns_400(auth_client_a, session_a, make_audio_file):
    url = f"{BASE}/{session_a.id}/replace-audio/"

    with _force_on_commit_to_run_immediately(), patch("therapy_sessions.tasks.transcribe_session.delay") as delay_mock:
        resp = auth_client_a.post(
            url,
            data={"audio_file": make_audio_file(), "language_code": "en"},
            format="multipart",
        )

    assert resp.status_code == 400
    delay_mock.assert_not_called()

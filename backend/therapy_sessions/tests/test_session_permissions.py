# backend/therapy_sessions/tests/test_session_permissions.py

import pytest
from datetime import timedelta
from django.utils import timezone

from patients.models import Patient
from therapy_sessions.models import TherapySession


API = "/api/v1"
SESSIONS_URL = f"{API}/sessions/"


@pytest.mark.django_db
class TestSessionPermissions:
    def test_cannot_access_other_therapist_session(self, auth_client_a, therapist_b):
        patient_b = Patient.objects.create(therapist=therapist_b, full_name="B1")
        session_b = TherapySession.objects.create(
            therapist=therapist_b,
            patient=patient_b,
            session_date=timezone.now() + timedelta(hours=1),
            duration_minutes=50,
        )

        res = auth_client_a.get(f"{SESSIONS_URL}{session_b.id}/")
        assert res.status_code in (403, 404), getattr(res, "data", None)

    def test_cannot_create_session_for_other_therapist_patient(self, auth_client_a, therapist_a, therapist_b):
        patient_a = Patient.objects.create(therapist=therapist_a, full_name="A1")
        patient_b = Patient.objects.create(therapist=therapist_b, full_name="B1")

        # allowed: create session for own patient
        ok_payload = {
            "patient": patient_a.id,  # ✅ correct field name
            "session_date": (timezone.now() + timedelta(days=1)).isoformat(),
            "duration_minutes": 50,
        }
        ok = auth_client_a.post(SESSIONS_URL, ok_payload, format="json")
        assert ok.status_code in (200, 201), ok.data

        # forbidden: cannot create session for other therapist's patient
        bad_payload = {
            "patient": patient_b.id,  # ✅ correct field name
            "session_date": (timezone.now() + timedelta(days=1)).isoformat(),
            "duration_minutes": 50,
        }
        bad = auth_client_a.post(SESSIONS_URL, bad_payload, format="json")
        assert bad.status_code in (400, 403, 404), bad.data

import pytest
from patients.models import Patient

API = "/api/v1"

# Adjust these once you confirm patients.urls
PATIENTS_URL = f"{API}/patients/"

@pytest.mark.django_db
class TestPatientPermissions:

    def test_list_patients_returns_only_own(self, auth_client_a, therapist_a, therapist_b):
        Patient.objects.create(therapist=therapist_a, full_name="A1")
        Patient.objects.create(therapist=therapist_b, full_name="B1")

        res = auth_client_a.get(PATIENTS_URL)
        assert res.status_code == 200

        names = [row["full_name"] for row in res.data]
        assert "A1" in names
        assert "B1" not in names

    def test_cannot_retrieve_other_therapist_patient(self, auth_client_a, therapist_b):
        other_patient = Patient.objects.create(therapist=therapist_b, full_name="B1")

        res = auth_client_a.get(f"{PATIENTS_URL}{other_patient.id}/")
        assert res.status_code in (403, 404)

    def test_cannot_update_other_therapist_patient(self, auth_client_a, therapist_b):
        other_patient = Patient.objects.create(therapist=therapist_b, full_name="B1")

        res = auth_client_a.patch(
            f"{PATIENTS_URL}{other_patient.id}/",
            {"full_name": "Hacked"},
            format="json",
        )
        assert res.status_code in (403, 404)

    def test_cannot_delete_other_therapist_patient(self, auth_client_a, therapist_b):
        other_patient = Patient.objects.create(therapist=therapist_b, full_name="B1")

        res = auth_client_a.delete(f"{PATIENTS_URL}{other_patient.id}/")
        assert res.status_code in (403, 404)

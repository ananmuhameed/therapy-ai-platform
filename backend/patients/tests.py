from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from patients.models import Patient, Session

User = get_user_model()

class SessionModelTest(TestCase):
    def test_session_creation(self):
        # 1. Create a temporary therapist using create_user()
        therapist = User.objects.create_user(
            email="therapist@test.com",
            password="test1234",
            is_therapist=True  # only if your model has this field
        )

        # 2. Create a patient linked to this therapist
        patient = Patient.objects.create(full_name="Temp Patient", therapist=therapist)

        # 3. Create a session linked to this patient
        session = Session.objects.create(
            patient=patient,
            session_date=timezone.now(),
            source="upload",
            status="recorded"
        )

        # 4. Assertions
        self.assertEqual(session.status, "recorded")
        self.assertEqual(session.source, "upload")
        self.assertEqual(session.patient.full_name, "Temp Patient")
        self.assertEqual(session.patient.therapist.email, "therapist@test.com")

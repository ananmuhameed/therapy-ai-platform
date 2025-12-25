from rest_framework import serializers
from patients.models import Patient
from therapy_sessions.models import TherapySession


class TherapySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TherapySession
        fields = [
            "id",
            "patient",
            "session_date",
            "duration_minutes",
            "status",
            "notes_before",
            "notes_after",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_patient(self, patient: Patient):
        request = self.context.get("request")
        if request and request.user and not request.user.is_anonymous:
            if patient.therapist_id != request.user.id:
                raise serializers.ValidationError(
                    "You can only create sessions for your own patients."
                )
        return patient

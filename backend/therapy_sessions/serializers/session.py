from rest_framework import serializers
from patients.models import Patient
from therapy_sessions.models import TherapySession
from therapy_sessions.serializers.audio import SessionAudioSerializer
from therapy_sessions.serializers.transcript import SessionTranscriptSerializer
from therapy_sessions.serializers.report import SessionReportSerializer


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

class SessionDetailSerializer(serializers.ModelSerializer):
    audio = SessionAudioSerializer(read_only=True)
    transcript = SessionTranscriptSerializer(read_only=True)
    report = SessionReportSerializer(read_only=True)

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
            "audio",
            "transcript",
            "report",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

from rest_framework import serializers
from patients.models import Patient
from therapy_sessions.models import TherapySession
from .transcript import SessionTranscriptSerializer
from .report import SessionReportSerializer

class TherapySessionSerializer(serializers.ModelSerializer):
    transcript = SessionTranscriptSerializer(read_only=True)
    report = SessionReportSerializer(read_only=True)
    audio_url = serializers.SerializerMethodField()
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
            "audio_url",
            "transcript",
            "report",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    def get_audio_url(self, obj):
        if hasattr(obj, 'audio') and obj.audio.audio_file:
            return obj.audio.audio_file.url
        return None
    def validate_patient(self, patient: Patient):
        request = self.context.get("request")
        if request and request.user and not request.user.is_anonymous:
            if patient.therapist_id != request.user.id:
                raise serializers.ValidationError(
                    "You can only create sessions for your own patients."
                )
        return patient

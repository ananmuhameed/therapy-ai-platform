from rest_framework import serializers
from patients.models import Patient
from .models import TherapySession


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

class SessionAudioUploadSerializer(serializers.Serializer):
    audio_file = serializers.FileField() # uploaded audio file
    language_code = serializers.CharField(max_length=10, required=False, allow_blank=True) # optional language code

    def validate_audio_file(self, audio_file):
        max_size_mb = 50
        if audio_file.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f"Audio file size should not exceed {max_size_mb} MB.")
        return audio_file
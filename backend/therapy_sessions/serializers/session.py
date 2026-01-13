from rest_framework import serializers
from patients.models import Patient
from therapy_sessions.models import TherapySession
from therapy_sessions.serializers.audio import SessionAudioSerializer
from therapy_sessions.serializers.transcript import SessionTranscriptSerializer
from therapy_sessions.serializers.report import SessionReportSerializer
from therapy_sessions.services.s3.s3_client import s3_client, s3_bucket


class TherapySessionSerializer(serializers.ModelSerializer):
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
            "transcript",
            "report",
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
    audio_url = serializers.SerializerMethodField()
    audio = SessionAudioSerializer(read_only=True)
    transcript = SessionTranscriptSerializer(read_only=True)
    report = SessionReportSerializer(read_only=True)
    patient_name = serializers.CharField(
        source="patient.full_name",
        read_only=True
    )
    class Meta:
        model = TherapySession
        fields = [
            "id",
            "patient",
           "patient_name",
            "session_date",
            "duration_minutes",
            "status",
            "notes_before",
            "notes_after",
            "created_at",
            "updated_at",
            "audio_url",
            "audio",
            "transcript",
            "report",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_audio_url(self, obj):
        audio = getattr(obj, "audio", None)
        if not audio or not audio.audio_file:
            return None

        s3 = s3_client()
        return s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": s3_bucket(),
                "Key": str(audio.audio_file),
            },
            ExpiresIn=60 * 60,  # 1 hour
        )

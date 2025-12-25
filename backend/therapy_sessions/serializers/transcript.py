# backend/therapy_sessions/serializers/transcript.py

from rest_framework import serializers
from therapy_sessions.models import SessionTranscript


class SessionTranscriptSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionTranscript
        fields = [
            "id",
            "session",
            "status",
            "language_code",
            "word_count",
            "raw_transcript",
            "cleaned_transcript",
            "model_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "session",
            "status",
            "language_code",
            "word_count",
            "model_name",
            "created_at",
            "updated_at",
        ]

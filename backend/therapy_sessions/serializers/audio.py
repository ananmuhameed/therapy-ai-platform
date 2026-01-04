from rest_framework import serializers
from therapy_sessions.models import SessionAudio


class SessionAudioSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = SessionAudio
        fields = [
            "id",
            "audio_url",
            "original_filename",
            "duration_seconds",
            "sample_rate",
            "language_code",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_audio_url(self, obj):
        request = self.context.get("request")
        if obj.audio_file:
            # absolute URL if request exists, else relative
            url = obj.audio_file.url
            return request.build_absolute_uri(url) if request else url
        return None


class SessionAudioUploadSerializer(serializers.Serializer):
    audio_file = serializers.FileField()
    language_code = serializers.CharField(max_length=10, required=False, allow_blank=True)

    def validate_audio_file(self, audio_file):
        max_size_mb = 50
        if audio_file.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(
                f"Audio file size should not exceed {max_size_mb} MB."
            )
        return audio_file

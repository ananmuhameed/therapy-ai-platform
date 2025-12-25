import json
from rest_framework import serializers
from therapy_sessions.models import SessionReport


def _safe_json_load(value, default):
    if not value:
        return default
    try:
        return json.loads(value)
    except Exception:
        return default


class SessionReportSerializer(serializers.ModelSerializer):
    key_points = serializers.SerializerMethodField()
    risk_flags = serializers.SerializerMethodField()
    treatment_plan = serializers.SerializerMethodField()

    class Meta:
        model = SessionReport
        fields = [
            "id",
            "session",
            "generated_summary",
            "key_points",
            "risk_flags",
            "treatment_plan",
            "therapist_notes",
            "status",
            "model_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields  # for now (GET only)

    def get_key_points(self, obj):
        return _safe_json_load(obj.key_points, default=[])

    def get_risk_flags(self, obj):
        return _safe_json_load(obj.risk_flags, default=[])

    def get_treatment_plan(self, obj):
        return _safe_json_load(obj.treatment_plan, default=[])

class SessionReportNotesSerializer(serializers.Serializer):
    therapist_notes = serializers.CharField(allow_blank=True, required=True)

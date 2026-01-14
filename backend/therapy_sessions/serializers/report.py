import json
from rest_framework import serializers
from therapy_sessions.models import SessionReport
import ast

def _safe_json_load(value, default):
    if value is None or value == "":
        return default

    # already a python object
    if isinstance(value, (list, dict)):
        return value

    if isinstance(value, str):
        s = value.strip()

        # try real JSON first
        try:
            return json.loads(s)
        except Exception:
            pass

        # fallback: parse python literals like "['a', 'b']" or "[{'x': 1}]"
        try:
            parsed = ast.literal_eval(s)
            if isinstance(parsed, (list, dict)):
                return parsed
        except Exception:
            pass

    return default



class SessionReportSerializer(serializers.ModelSerializer):
    key_points = serializers.JSONField(read_only=True)
    risk_flags = serializers.JSONField(read_only=True)
    treatment_plan = serializers.JSONField(read_only=True)

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
        read_only_fields = fields


class SessionReportNotesSerializer(serializers.Serializer):
    therapist_notes = serializers.CharField(allow_blank=True, required=True)


class SessionReportUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionReport
        fields = [
            "generated_summary",
            "therapist_notes",
            "key_points",
            "risk_flags",
            "treatment_plan",
            "therapist_notes",
        ]

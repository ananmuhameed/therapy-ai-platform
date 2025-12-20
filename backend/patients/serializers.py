from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    therapist = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id",
            "therapist",
            "full_name",
            "gender",
            "date_of_birth",
            "contact_phone",
            "contact_email",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "therapist", "created_at", "updated_at"]

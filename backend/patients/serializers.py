from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    therapist = serializers.PrimaryKeyRelatedField(read_only=True)
    contact_email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)


    class Meta:
        model = Patient
        fields = [
            "id",
            "therapist",
            "full_name",
            "patient_id",
            "gender",
            "date_of_birth",
            "contact_phone",
            "contact_email",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "therapist", "created_at", "updated_at"]

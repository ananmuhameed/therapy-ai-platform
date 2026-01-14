import re
from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    therapist = serializers.PrimaryKeyRelatedField(read_only=True)

    contact_email = serializers.EmailField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)
    national_id = serializers.CharField(required=False, allow_blank=True)

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
            "national_id",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "therapist", "created_at", "updated_at"]

    # -------------------------
    # Full name validation
    # -------------------------
    def validate_full_name(self, value):
        value = value.strip()

        # Letters only (Arabic & English) + spaces
        if not re.fullmatch(r"[A-Za-z\u0600-\u06FF ]+", value):
            raise serializers.ValidationError(
                "Full name must contain letters only (no numbers or symbols)."
            )

        parts = [p for p in value.split(" ") if p]
        if len(parts) < 3:
            raise serializers.ValidationError(
                "Full name must be at least three words."
            )

        return value

    # -------------------------
    # National ID validation
    # -------------------------
    def validate_national_id(self, value):
        if not value:
            return value

        if not value.isdigit():
            raise serializers.ValidationError(
                "National ID must contain digits only."
            )

        if len(value) != 14:
            raise serializers.ValidationError(
                "National ID must be exactly 14 digits."
            )

        return value

    # -------------------------
    # Egyptian phone validation
    # -------------------------
    def validate_contact_phone(self, value):
        if not value:
            return value

        # Remove everything except digits
        digits = re.sub(r"\D", "", value)

        # Normalize international formats
        if digits.startswith("0020"):
            digits = digits[4:]
        elif digits.startswith("20"):
            digits = digits[2:]

        # Ensure local Egyptian format
        if not digits.startswith("0"):
            digits = "0" + digits

        # Must be exactly 11 digits
        if len(digits) != 11:
            raise serializers.ValidationError(
                "Egyptian phone number must be exactly 11 digits."
            )

        # Valid Egyptian mobile prefixes
        if not digits.startswith(("010", "011", "012", "015")):
            raise serializers.ValidationError(
                "Phone number must be a valid Egyptian mobile number."
            )

        return digits

    # -------------------------
    # Gender validation
    # -------------------------
    def validate_gender(self, value):
        if not value:
            return value

        if value not in ["male", "female"]:
            raise serializers.ValidationError(
                "Invalid gender value."
            )

        return value

    # -------------------------
    # Uniqueness validation
    # -------------------------
    def validate(self, attrs):
        therapist = self.context["request"].user

        email = attrs.get("contact_email")
        phone = attrs.get("contact_phone")
        national_id = attrs.get("national_id")

        if email and Patient.objects.filter(
            therapist=therapist,
            contact_email=email
        ).exists():
            raise serializers.ValidationError({
                "contact_email": "This email is already used for another patient."
            })

        if phone and Patient.objects.filter(
            therapist=therapist,
            contact_phone=phone
        ).exists():
            raise serializers.ValidationError({
                "contact_phone": "This phone number is already used for another patient."
            })

        if national_id and Patient.objects.filter(
            therapist=therapist,
            national_id=national_id
        ).exists():
            raise serializers.ValidationError({
                "national_id": "This national ID is already used for another patient."
            })

        return attrs
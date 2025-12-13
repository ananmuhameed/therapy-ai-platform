from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # receive plain password, write-only
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        # include custom fields you want users to submit at registration
        fields = ["email", "password", "first_name", "last_name", "is_therapist"]

    def create(self, validated_data):
        # Use set_password so hashing is applied
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        # If you want newly registered users to be staff by default set flags here (usually False)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_therapist", "specialty"]
        read_only_fields = ["id", "email"]

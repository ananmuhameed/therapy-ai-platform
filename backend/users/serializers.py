from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(required=True, allow_blank=False)
    last_name = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "password", "password_confirm"]

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password') # popped to manually hash it
        validated_data.pop('password_confirm', None) # removed because it's not a model field, during save will cause error
    
        # **validated_data? unpack the dictionary into keyword arguments.
        # validated_data = {
        # "email": "therapist@example.com",
        # "full_name": "Dr. Jane Doe",}
    # expands to
        # user = User(
        # email="therapist@example.com",
        # full_name="Dr. Jane Doe",)

        # Uses your UserManager => hashes password + normalizes email
        user = User.objects.create_user(password=password, **validated_data)
        return user

class UserPublicSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name"]

    def get_full_name(self, obj):
        return obj.get_full_name()
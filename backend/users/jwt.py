from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserPublicSerializer

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT to:
    - accept email + password
    - return tokens + user public payload
    """

    # Force the input field to be "email" instead of "username"
    username_field = "email"

    def validate(self, attrs):
        # attrs contains { "email": ..., "password": ... }
        credentials = {
            self.username_field: attrs.get(self.username_field),
            "password": attrs.get("password"),
        }
        # authenticate() expects keyword matching USERNAME_FIELD, which is "email" in our case
        # hashe's password and compares with hashed password in DB
        #if either email or password is wrong returns None
        user = authenticate(**credentials)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is disabled.")

        # SimpleJWT generates refresh and access tokens using already validated user
        data = super().validate(attrs)

        # Add user payload for frontend convenience
        data["user"] = UserPublicSerializer(user).data
        return data


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

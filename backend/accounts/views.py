from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .serializers import RegisterSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]  # Registration must be public

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        # Explicit response, don't just return serializer.data (which includes id/email/full_name anyway)
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
            },
            status=status.HTTP_201_CREATED,
        )
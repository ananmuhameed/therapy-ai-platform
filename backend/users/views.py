from urllib import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import TherapistProfile

from .serializers import RegisterSerializer, TherapistProfileUpdateSerializer, UserPublicSerializer,TherapistProfileSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.get_full_name(),
            },
            status=status.HTTP_201_CREATED,
        )
    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserPublicSerializer(request.user).data)
    
class TherapistProfileAPIView(APIView):
    """
    API endpoint for managing the authenticated therapist profile.

    Responsibilities:
    - GET: Retrieve the logged-in therapist profile.
    - PATCH: Partially update the therapist profile.
    - Automatically create a profile if it does not exist.
    - Prevent invalid completion attempts.
    - Mark profile as completed only when required fields are present.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        """
        Always return the therapist profile for the authenticated user.
        Auto-create if missing.
        """
        profile, _ = TherapistProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        """
        Return the therapist profile for the authenticated user.
        """
        profile = self.get_object(request.user)
        serializer = TherapistProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """
        Partially update the therapist profile.

        Rules:
        - If profile is NOT completed yet:
            → This PATCH is considered a completion attempt
            → All required fields must be present
        - If profile IS already completed:
            → Allow partial updates freely
        """
        profile = self.get_object(request.user)

        # Fields required for first-time completion
        REQUIRED_FIELDS = [
            "specialization",
            "license_number",
            "years_experience",
            "clinic_name",
        ]

        # FIRST-TIME COMPLETION VALIDATION
        if not profile.is_completed:
            missing_fields = []

            for field in REQUIRED_FIELDS:
                # value can come from request OR existing profile
                value = request.data.get(field) or getattr(profile, field)

                if not value:
                    missing_fields.append(field)

            if missing_fields:
                return Response(
                    {
                        "detail": "Profile completion requires all mandatory fields.",
                        "missing_fields": missing_fields,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Apply PATCH (partial update allowed)
        serializer = TherapistProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        # Mark profile as completed AFTER first successful completion
        if not profile.is_completed:
            profile.is_completed = True
            profile.save(update_fields=["is_completed"])

        return Response(
            TherapistProfileSerializer(profile).data,
            status=status.HTTP_200_OK,
        )
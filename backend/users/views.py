import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import TherapistProfile
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, TherapistProfileUpdateSerializer, UserPublicSerializer,TherapistProfileSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .utils.google import verify_google_access_token
from .serializers import GoogleLoginSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import EmailVerification
from .tasks import send_verification_email
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404

User = get_user_model()
class RegisterView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        verification = EmailVerification.objects.create(
        user=user,
        expires_at=timezone.now() + timedelta(minutes=25),
        )

        send_verification_email.delay(
         user.email,
         str(verification.token),
         )

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
    
class TherapistProfileView(APIView):
    """
    API endpoint for managing the authenticated therapist profile.

    Responsibilities:
    - GET: Retrieve the logged-in therapist profile.
    - PATCH: Partially update the therapist profile.
    - Automatically create a profile if it does not exist.
    - Automatically mark profile as completed once required fields are filled.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        """
        Retrieve the TherapistProfile for the given user.

        If the profile does not exist, it will be created automatically.
        This ensures the frontend can always rely on having a profile object.

        Args:
            user (User): The authenticated user.

        Returns:
            TherapistProfile: The user's therapist profile.
        """
        profile, _ = TherapistProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        """
        Returns the therapist profile of the currently authenticated user.
        """
        profile = self.get_object(request.user)
        serializer = TherapistProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        """
        Partially update the therapist profile.
        Only provided fields will be updated (partial update).

        After updating:
        - Checks whether the required fields are filled.
        - If all required fields are present, marks the profile as completed.
        """
        profile = self.get_object(request.user)

        # Use a restricted serializer for updates
        serializer = TherapistProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,  # Allows updating only sent fields
        )
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        # fields required to consider the profile "completed"
        REQUIRED_FIELDS = [
            "specialization",
            "license_number",
            "clinic_name",
            "country",
            "city",
        ]

        # mark profile as completed once all required fields are filled
        if all(getattr(profile, field) for field in REQUIRED_FIELDS):
            if not profile.is_completed:
                profile.is_completed = True
                profile.save(update_fields=["is_completed"])

        # return the full profile using the read serializer
        return Response(
            TherapistProfileSerializer(profile).data,
            status=status.HTTP_200_OK,
        )
    
    def delete(self, request):
        """
        Deletes the authenticated user and their profile.
        """
        user = request.user
        user.delete() # This deletes the User record and cascades to the Profile
        return Response(status=status.HTTP_204_NO_CONTENT)




class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        google_user = verify_google_access_token(
            serializer.validated_data["access_token"]
        )

        if not google_user:
            return Response(
                {"detail": "Invalid Google token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = google_user.get("email")

        if not email:
            return Response(
                {"detail": "Google account has no email"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": google_user.get("given_name", ""),
                "last_name": google_user.get("family_name", ""),
                "is_therapist": True,
            },
        )

        # Ensure therapist profile exists
        TherapistProfile.objects.get_or_create(user=user)

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": user.get_full_name(),
                    "is_therapist": user.is_therapist,
                },
            },
            status=status.HTTP_200_OK,
        )
 # =========================
# VERIFY EMAIL
# =========================
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")

        verification = get_object_or_404(
            EmailVerification,
            token=token,
            used=False,
            expires_at__gt=timezone.now()
        )

        user = verification.user
        user.is_verified = True
        user.save()

        verification.used = True
        verification.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "user": UserPublicSerializer(user).data,
        })
# =========================
# RESEND VERIFICATION
# =========================
class ResendVerificationView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"email": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"email": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_verified:
            return Response(
                {"detail": "Email already verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification, _ = EmailVerification.objects.update_or_create(
            user=user,
            defaults={
                "token": uuid.uuid4(),
                "expires_at": timezone.now() + timedelta(minutes=30),
                "used": False,
            },
        )

        send_verification_email.delay(user.email, verification.token)

        return Response(
            {"detail": "Verification email resent"},
            status=status.HTTP_200_OK,
        )



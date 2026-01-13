from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import TherapistProfile, EmailVerification
from .serializers import RegisterSerializer, TherapistProfileUpdateSerializer, UserPublicSerializer, TherapistProfileSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .tasks import send_verification_email


User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Remove any old tokens
        EmailVerification.objects.filter(user=user).delete()

        verification = EmailVerification.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(minutes=25),
        )

        send_verification_email.delay(user.email, str(verification.token))

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
    permission_classes = [IsAuthenticated]

    def get_object(self, user):
        profile, _ = TherapistProfile.objects.get_or_create(user=user)
        return profile

    def get(self, request):
        profile = self.get_object(request.user)
        serializer = TherapistProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = self.get_object(request.user)

        serializer = TherapistProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        REQUIRED_FIELDS = [
            "specialization",
            "license_number",
            "clinic_name",
            "country",
            "city",
        ]

        if all(getattr(profile, field) for field in REQUIRED_FIELDS):
            if not profile.is_completed:
                profile.is_completed = True
                profile.save(update_fields=["is_completed"])

        return Response(
            TherapistProfileSerializer(profile).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# =========================
# VERIFY EMAIL
# =========================
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")

        if not token:
            return Response(
                {"detail": "Token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            verification = EmailVerification.objects.get(token=token)
        except EmailVerification.DoesNotExist:
            return Response(
                {"detail": "Invalid verification token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = verification.user

        # If expired
        if verification.expires_at < timezone.now():
            return Response(
                {"detail": "Verification link has expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark user verified if not already
        if not user.is_verified:
            user.is_verified = True
            user.save(update_fields=["is_verified"])

        # Cleanup token
        verification.used = True
        verification.save()
        verification.delete()

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "user": UserPublicSerializer(user).data,
        })




# =========================
# RESEND VERIFICATION
# =========================
class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

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

        # Delete old tokens
        EmailVerification.objects.filter(user=user).delete()

        verification = EmailVerification.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(minutes=30),
        )

        send_verification_email.delay(user.email, str(verification.token))

        return Response(
            {"detail": "Verification email resent"},
            status=status.HTTP_200_OK,
        )

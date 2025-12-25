from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from users.models import TherapistProfile


class DashboardView(APIView):
    """
    Protected dashboard endpoint.

    Rules:
    - User must be authenticated (JWT).
    - Therapist profile must be completed.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Allow access to dashboard ONLY if therapist profile is completed.
        """

        # Get therapist profile for logged-in user
        profile = TherapistProfile.objects.filter(user=request.user).first()

        # Safety check (should not normally happen)
        if not profile:
            return Response(
                {"detail": "Therapist profile not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Profile NOT completed → block access
        if not profile.is_completed:
            return Response(
                {
                    "detail": "Profile is not completed.",
                    "action_required": "Complete your profile first.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Profile completed → allow dashboard
        return Response(
            {"message": "Welcome to dashboard"},
            status=status.HTTP_200_OK,
        )
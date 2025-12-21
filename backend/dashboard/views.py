from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from patients.models import Patient
from therapy_sessions.models import TherapySession


class TherapistDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        therapist = request.user

        # Patients count
        patients_count = Patient.objects.filter(
            therapist=therapist
        ).count()

        # Calculate current week range
        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        end_of_week = start_of_week + timedelta(days=7)

        # Sessions this week
        sessions_this_week = TherapySession.objects.filter(
            therapist=therapist,
            session_date__gte=start_of_week,
            session_date__lt=end_of_week,
        ).count()

        return Response({
            "patients_count": patients_count,
            "sessions_this_week": sessions_this_week,
        })
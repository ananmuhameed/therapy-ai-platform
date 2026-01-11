from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from patients.models import Patient
from therapy_sessions.models import TherapySession
from therapy_sessions.models import SessionReport  # adjust if your app name differs


class TherapistDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        therapist = request.user  # or request.user.therapist

        now = timezone.now()
        start_of_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end_of_week = start_of_week + timedelta(days=7)


        patients_count = Patient.objects.filter(therapist=therapist).count()

        sessions_this_week = TherapySession.objects.filter(
            therapist=therapist,
            created_at__gte=start_of_week,
            created_at__lt=end_of_week,
        ).count()


        reports_ready_this_week = SessionReport.objects.filter(
            session__therapist=therapist,
            status="completed",
            updated_at__gte=start_of_week,
            updated_at__lt=end_of_week,
        ).count()

        return Response({
            "patients_count": patients_count,
            "sessions_this_week": sessions_this_week,
            "reports_ready_this_week": reports_ready_this_week,
        })

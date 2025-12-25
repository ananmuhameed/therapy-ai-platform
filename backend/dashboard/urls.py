from django.urls import path
from .views import TherapistDashboardStatsView

urlpatterns = [
path("", TherapistDashboardStatsView.as_view(), name="therapist_dashboard"),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from therapy_sessions.views.sessions import TherapySessionViewSet
from therapy_sessions.views.dashboard import TherapistDashboardStatsView

router = DefaultRouter()
router.register(r"sessions", TherapySessionViewSet, basename="sessions")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", TherapistDashboardStatsView.as_view(), name="dashboard-stats"),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TherapySessionViewSet

router = DefaultRouter()
router.register(r"sessions", TherapySessionViewSet, basename="sessions")

urlpatterns = [
    path("", include(router.urls)),
]

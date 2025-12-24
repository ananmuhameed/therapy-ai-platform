from django.urls import path
from .views import RegisterView, MeView,TherapistProfileAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .jwt import LoginView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth_register"),
    path("auth/login/", LoginView.as_view(), name="auth_login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="auth_me"),
    path("therapist/profile/", TherapistProfileAPIView.as_view(), name="therapist_profile_api"),
]

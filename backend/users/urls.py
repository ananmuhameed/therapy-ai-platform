from django.urls import path
from .views import RegisterView, MeView, TherapistProfileView
from .jwt import LoginView, CookieTokenRefreshView, logout_view

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth_register"),
    path("auth/login/", LoginView.as_view(), name="auth_login"),
    path("auth/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", logout_view, name="auth_logout"),
    path("auth/me/", MeView.as_view(), name="auth_me"),
    path("therapist/profile/", TherapistProfileView.as_view(), name="therapist_profile"),
]

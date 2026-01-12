from django.conf import settings
from django.contrib.auth import authenticate

from .serializers import UserPublicSerializer
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken

REFRESH_COOKIE = "refresh_token"

def set_refresh_cookie(response, refresh_token: str, max_age: int):
    secure = not settings.DEBUG  # dev http => False, prod https => True
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/api/v1/auth/",
        max_age=max_age,
    )

def clear_refresh_cookie(response):
    response.delete_cookie(
        key=REFRESH_COOKIE,
        path="/api/v1/auth/",
        samesite="Lax",
    )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        remember_me = request.data.get("remember_me", False)

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_verified:
            return Response(
                {"detail": "Please verify your email before logging in."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        if remember_me:
            max_age = settings.REMEMBER_ME_REFRESH_AGE  # 30 days
        else:
            max_age = settings.DEFAULT_REFRESH_AGE  # 1 day

        resp = Response(
            {"access": access, "user": UserPublicSerializer(user).data},
            status=status.HTTP_200_OK,
        )
        set_refresh_cookie(resp, str(refresh), max_age)
        return resp


class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(REFRESH_COOKIE)
        if not refresh:
            raise InvalidToken("No refresh token cookie")

        request.data["refresh"] = refresh
        response = super().post(request, *args, **kwargs)

        # If rotate refresh is enabled, SimpleJWT returns a new refresh in response.data["refresh"]
        new_refresh = response.data.get("refresh")
        if new_refresh:
            set_refresh_cookie(
                response,
                new_refresh,
                max_age=settings.DEFAULT_REFRESH_AGE
            )
            del response.data["refresh"]

        return response

@api_view(["POST"])
def logout_view(request):
    refresh = request.COOKIES.get(REFRESH_COOKIE)
    resp = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)

    if refresh:
        try:
            RefreshToken(refresh).blacklist()
        except Exception:
            pass

    clear_refresh_cookie(resp)
    return resp
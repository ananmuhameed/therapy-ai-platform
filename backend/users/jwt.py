from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from .serializers import UserPublicSerializer, GoogleLoginSerializer
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from .utils.google import verify_google_access_token
from .models import TherapistProfile

User = get_user_model()
REFRESH_COOKIE = "refresh_token"

def set_refresh_cookie(response, refresh_token: str, max_age: int):
    refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]

    response.set_cookie(
        key=REFRESH_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,  # dev http => False, prod https => True
        samesite="Lax",             # if frontend+backend on different domains, you may need "None" + Secure=True
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
        remember_me = request.data.get("remember_me", False) # retrieve remember_me flag from the request

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

        if remember_me:
            refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME_LONG"]
        else:
            refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]

        refresh.set_exp(lifetime=refresh_lifetime)

        access = str(refresh.access_token)

        resp = Response(
            {"access": access, "user": UserPublicSerializer(user).data},
            status=status.HTTP_200_OK,
        )
        set_refresh_cookie(resp, str(refresh), max_age=int(refresh_lifetime.total_seconds()))
        print("LOGIN VIEW HIT - SETTING COOKIE")
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
            remember_me = request.data.get("remember_me", False)  # You may want to extract this from the request
            if remember_me:
                refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME_LONG"]  # 30 days if "Remember Me" is checked
            else:
                refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
            set_refresh_cookie(
                response,
                new_refresh,
                max_age=refresh_lifetime.total_seconds(),
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

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        remember_me = request.data.get("remember_me", False)

        google_user = verify_google_access_token(serializer.validated_data["access_token"])
        if not google_user:
            return Response({"detail": "Invalid Google token"}, status=status.HTTP_401_UNAUTHORIZED)

        email = google_user.get("email")
        if not email:
            return Response({"detail": "Google account has no email"}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": google_user.get("given_name", ""),
                "last_name": google_user.get("family_name", ""),
                "is_therapist": True,
            },
        )

        TherapistProfile.objects.get_or_create(user=user)

        refresh = RefreshToken.for_user(user)

        if remember_me:
            refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME_LONG"]
        else:
            refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
        refresh.set_exp(lifetime=refresh_lifetime)

        access = str(refresh.access_token)

        resp = Response(
            {
                "access": access,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": user.get_full_name(),
                    "is_therapist": user.is_therapist,
                },
            },
            status=status.HTTP_200_OK,
        )

        set_refresh_cookie(resp, str(refresh), max_age=refresh_lifetime.total_seconds())
        print("LOGIN VIEW HIT - SETTING COOKIE")
        resp["x-AUTH-VIEW"] = "cookie-login"
        return resp
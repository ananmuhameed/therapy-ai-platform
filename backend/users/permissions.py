from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied


class IsTherapistProfileCompleted(BasePermission):
    """
    Allows therapists to READ data even if profile is incomplete.
    Blocks WRITE actions (POST, PATCH, DELETE) until profile is completed.
    """

    message = "Please complete your profile before performing this action."

    def has_permission(self, request, view):
        user = request.user

        # must be authenticated
        if not user or not user.is_authenticated:
            return False

        # allow SAFE methods (GET, HEAD, OPTIONS)
        if request.method in SAFE_METHODS:
            return True

        # must be therapist
        if not getattr(user, "is_therapist", False):
            raise PermissionDenied("Only therapists can perform this action.")

        # must have profile
        profile = getattr(user, "therapist_profile", None)
        if not profile:
            return False

        # WRITE actions require completed profile
        return profile.is_completed is True
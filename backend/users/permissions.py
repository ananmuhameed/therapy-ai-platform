from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied


class IsTherapistProfileCompleted(BasePermission):
    """
    Allows access only to therapists who have completed their profile.

    This permission is intended to protect write actions (POST / PATCH / DELETE)
    such as:
    - Creating patients
    - Creating therapy sessions

    Therapists with incomplete profiles can still READ data,
    but cannot perform restricted actions.
    """

    message = "Please complete your profile before performing this action."

    def has_permission(self, request, view):
        user = request.user

        # Safety check (should already be authenticated)
        if not user or not user.is_authenticated:
            return False

        # If user is NOT a therapist, block
        if not getattr(user, "is_therapist", False):
            raise PermissionDenied("Only therapists can perform this action.")

        # If therapist has no profile, treat as incomplete
        profile = getattr(user, "therapist_profile", None)
        if not profile:
            return False

        # Final decision: profile must be completed
        return profile.is_completed is True
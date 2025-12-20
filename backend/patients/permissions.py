from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsTherapist(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_therapist", False))


class IsOwnerTherapist(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.therapist_id == request.user.id

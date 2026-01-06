# users/throttles.py
from rest_framework.throttling import SimpleRateThrottle


class AuthRateThrottle(SimpleRateThrottle):
    """
    Throttle for authentication endpoints (login / register).
    Uses client IP because the user is not authenticated yet.
    """
    scope = "auth"

    def get_cache_key(self, request, view):
        return self.get_ident(request)
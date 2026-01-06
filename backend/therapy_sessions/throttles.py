from rest_framework.throttling import UserRateThrottle


class UploadAudioRateThrottle(UserRateThrottle):
    """
    Throttle for uploading session audio.
    Heavy endpoint (file upload + processing).
    """
    scope = "upload_audio"
from django.db import transaction

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from therapy_sessions.models import TherapySession, SessionAudio
from therapy_sessions.tasks import transcribe_session

from therapy_sessions.serializers.session import TherapySessionSerializer, SessionDetailSerializer
from therapy_sessions.serializers.audio import SessionAudioUploadSerializer
from users.permissions import IsTherapistProfileCompleted

class TherapySessionViewSet(viewsets.ModelViewSet):
    serializer_class = TherapySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Session creation is allowed for authenticated therapists.
        Profile completion is enforced at the UI level, not API level.
        """
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == "retrieve":
            return SessionDetailSerializer
        return TherapySessionSerializer
 
    def get_queryset(self):
        qs = TherapySession.objects.select_related(
         "patient", "audio", "transcript", "report"
        ).filter(therapist=self.request.user)

        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        return qs

    def perform_create(self, serializer):
        patient = serializer.validated_data["patient"]
        if patient.therapist_id != self.request.user.id:
            raise PermissionDenied("You can only create sessions for your own patients.")
        serializer.save(therapist=self.request.user)

    @action(detail=True, methods=["post"], url_path="upload-audio")
    def upload_audio(self, request, pk=None):
        session = self.get_object()

        ser = SessionAudioUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        uploaded_file = ser.validated_data["audio_file"]
        language_code = ser.validated_data.get("language_code", "") or ""

        with transaction.atomic():
            locked = TherapySession.objects.select_for_update().get(pk=session.pk)

            if SessionAudio.objects.filter(session=locked).exists():
                return Response(
                    {"detail": "Audio already uploaded for this session, use replace-audio endpoint."},
                    status=status.HTTP_409_CONFLICT,
                )

            audio = SessionAudio.objects.create(
                session=locked,
                audio_file=uploaded_file,
                original_filename=(getattr(uploaded_file, "name", "") or "")[:255],
                language_code=language_code,
            )

            locked.status = "transcribing"
            locked.last_error_stage = ""
            locked.last_error_message = ""
            locked.save(update_fields=["status", "last_error_stage", "last_error_message", "updated_at"])

            # enqueue transcription task after DB commit
            transaction.on_commit(lambda: transcribe_session.delay(locked.id))

        return Response(
            {"detail": "Upload successful. Transcription started.", "audio_id": audio.id},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="replace-audio")
    def replace_audio(self, request, pk=None):
        session = self.get_object()

        ser = SessionAudioUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        uploaded_file = ser.validated_data["audio_file"]
        language_code = ser.validated_data.get("language_code") or ""

        with transaction.atomic():
            locked = TherapySession.objects.select_for_update().get(pk=session.pk)

            old_audio = SessionAudio.objects.filter(session=locked).first()
            if not old_audio:
                return Response(
                    {"detail": "No audio found. Use upload-audio first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Optional: delete file too
            try:
                if old_audio.audio_file:
                    old_audio.audio_file.delete(save=False)
            except Exception:
                pass

            old_audio.delete()

            new_audio = SessionAudio.objects.create(
                session=locked,
                audio_file=uploaded_file,
                original_filename=(getattr(uploaded_file, "name", "") or "")[:255],
                language_code=language_code,
            )

            locked.status = "transcribing"
            locked.last_error_stage = ""
            locked.last_error_message = ""
            locked.save(update_fields=["status", "last_error_stage", "last_error_message", "updated_at"])

            # enqueue transcription task after DB commit
            transaction.on_commit(lambda: transcribe_session.delay(locked.id))

        return Response(
            {"detail": "Audio replaced. Transcription restarted.", "audio_id": new_audio.id},
            status=status.HTTP_200_OK,
        )

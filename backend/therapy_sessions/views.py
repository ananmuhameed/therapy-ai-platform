from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from .models import TherapySession, SessionAudio
from rest_framework.response import Response
from .serializers import TherapySessionSerializer, SessionAudioUploadSerializer
from rest_framework.decorators import action

class TherapySessionViewSet(viewsets.ModelViewSet):
    serializer_class = TherapySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = TherapySession.objects.select_related("patient").filter(therapist=self.request.user)

        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)

        return qs

    def perform_create(self, serializer):
        patient = serializer.validated_data["patient"]
        if patient.therapist_id != self.request.user.id:
            raise PermissionDenied("You can only create sessions for your own patients.")
        serializer.save(therapist=self.request.user)

    @action(detail=True, methods=["post"], url_path="upload-audio") #
    def upload_audio(self, request, pk=None):
        session = self.get_object() # get the TherapySession instance
        # already scoped to therapist via get_queryset no need to check again

        ser = SessionAudioUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        uploaded_file = ser.validated_data["audio_file"] 
        language_code = ser.validated_data.get("language_code", "")

        with transaction.atomic():
            #lock the session row to prevent double uploads (race conditions)
            locked = TherapySession.objects.select_for_update().get(pk=session.pk)
            # Save or update the audio file
            if hasattr(locked, "audio"):
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

            # pipeline status goes to transcribing immediately after successful save
            locked.status = "transcribing"
            locked.last_error_stage = ""
            locked.last_error_message = ""
            locked.save(update_fields=["status", "last_error_stage", "last_error_message", "updated_at"])

        #TO-DO
        # enqueue transcription task here (after DB commit)
        # transcribe_session.delay(session_id=locked.id)

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
        language_code = ser.validated_data.get("language_code") or None

        with transaction.atomic():
            locked = TherapySession.objects.select_for_update().get(pk=session.pk)

            # must already have audio to replace (your choice; or allow both)
            if not hasattr(locked, "audio"):
                return Response(
                    {"detail": "No audio found. Use upload-audio first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # delete old audio 
            old_audio = locked.audio
            old_audio.delete() 

            # create new audio
            new_audio = SessionAudio.objects.create(
                session=locked,
                audio_file=uploaded_file,
                original_filename=(getattr(uploaded_file, "name", "") or "")[:255],
                language_code=language_code,
            )

            # reset pipeline + errors
            locked.status = "transcribing"
            locked.last_error_stage = ""
            locked.last_error_message = ""

            # TODO: clear transcript/report fields if you have them
            # locked.transcript_text = ""
            # locked.report_pdf = None
            # locked.report_json = {}

            locked.save(update_fields=["status", "last_error_stage", "last_error_message", "updated_at"])

        # enqueue transcription
        # transcribe_session.delay(session_id=locked.id)

        return Response(
            {"detail": "Audio replaced. Transcription restarted.", "audio_id": new_audio.id},
            status=status.HTTP_200_OK,
        )
# from django.db import transaction
# from django.conf import settings
# from django.utils import timezone

# # from rest_framework import permissions, status, viewsets
# # from rest_framework.decorators import action
# # from rest_framework.exceptions import PermissionDenied
# # from rest_framework.response import Response

# from therapy_sessions.models import TherapySession, SessionAudio, SessionAudioUpload
# from therapy_sessions.tasks import transcribe_session

# # from therapy_sessions.serializers.session import TherapySessionSerializer, SessionDetailSerializer
# # from therapy_sessions.serializers.audio import SessionAudioUploadSerializer
# # from users.permissions import IsTherapistProfileCompleted

# from therapy_sessions.serializers.audio_multipart import ( MultipartPresignSerializer, MultipartCompleteSerializer)
# from therapy_sessions.services.s3.s3_client import s3_client, s3_bucket
# from therapy_sessions.services.s3.storage_key import session_audio_key 

# MULTIPART_PART_SIZE = 10 * 1024 * 1024  # 10 MB
# class TherapySessionViewSet(viewsets.ModelViewSet):
#     serializer_class = TherapySessionSerializer
#     permission_classes = [permissions.IsAuthenticated]

# #     def get_permissions(self):
# #         """
# #         Session creation is allowed for authenticated therapists.
# #         Profile completion is enforced at the UI level, not API level.
# #         """
# #         return [permissions.IsAuthenticated()]
    
# #     def get_serializer_class(self):
# #         if self.action == "retrieve":
# #             return SessionDetailSerializer
# #         return TherapySessionSerializer
 
# #     def get_queryset(self):
# #         qs = TherapySession.objects.select_related(
# #          "patient", "audio", "transcript", "report"
# #         ).filter(therapist=self.request.user)

# #         patient_id = self.request.query_params.get("patient_id")
# #         if patient_id:
# #             qs = qs.filter(patient_id=patient_id)

# #         return qs

# #     def perform_create(self, serializer):
# #         patient = serializer.validated_data["patient"]
# #         if patient.therapist_id != self.request.user.id:
# #             raise PermissionDenied("You can only create sessions for your own patients.")
# #         serializer.save(therapist=self.request.user)

# #     @action(detail=True, methods=["post"], url_path="upload-audio")
# #     def upload_audio(self, request, pk=None):
# #         session = self.get_object()

# #         ser = SessionAudioUploadSerializer(data=request.data)
# #         ser.is_valid(raise_exception=True)

# #         uploaded_file = ser.validated_data["audio_file"]
# #         language_code = ser.validated_data.get("language_code", "") or ""

# #         with transaction.atomic():
# #             locked = TherapySession.objects.select_for_update().get(pk=session.pk)

# #             if SessionAudio.objects.filter(session=locked).exists():
# #                 return Response(
# #                     {"detail": "Audio already uploaded for this session, use replace-audio endpoint."},
# #                     status=status.HTTP_409_CONFLICT,
# #                 )

# #             audio = SessionAudio.objects.create(
# #                 session=locked,
# #                 audio_file=uploaded_file,
# #                 original_filename=(getattr(uploaded_file, "name", "") or "")[:255],
# #                 language_code=language_code,
# #             )

# #             locked.status = "transcribing"
# #             locked.last_error_stage = ""
# #             locked.last_error_message = ""
# #             locked.save(update_fields=["status", "last_error_stage", "last_error_message", "updated_at"])

# #             # enqueue transcription task after DB commit
# #             transaction.on_commit(lambda: transcribe_session.delay(locked.id))

# #         return Response(
# #             {"detail": "Upload successful. Transcription started.", "audio_id": audio.id},
# #             status=status.HTTP_201_CREATED,
# #         )

# #     @action(detail=True, methods=["post"], url_path="replace-audio")
# #     def replace_audio(self, request, pk=None):
# #         session = self.get_object()

# #         ser = SessionAudioUploadSerializer(data=request.data)
# #         ser.is_valid(raise_exception=True)

# #         uploaded_file = ser.validated_data["audio_file"]
# #         language_code = ser.validated_data.get("language_code") or ""

# #         with transaction.atomic():
# #             locked = TherapySession.objects.select_for_update().get(pk=session.pk)

# #             old_audio = SessionAudio.objects.filter(session=locked).first()
# #             if not old_audio:
# #                 return Response(
# #                     {"detail": "No audio found. Use upload-audio first."},
# #                     status=status.HTTP_400_BAD_REQUEST,
# #                 )

# #             # Optional: delete file too
# #             try:
# #                 if old_audio.audio_file:
# #                     old_audio.audio_file.delete(save=False)
# #             except Exception:
# #                 pass

# #             old_audio.delete()

# #             new_audio = SessionAudio.objects.create(
# #                 session=locked,
# #                 audio_file=uploaded_file,
# #                 original_filename=(getattr(uploaded_file, "name", "") or "")[:255],
# #                 language_code=language_code,
# #             )

# #             locked.status = "transcribing"
# #             locked.last_error_stage = ""
# #             locked.last_error_message = ""
# #             locked.save(update_fields=["status", "last_error_stage", "last_error_message", "updated_at"])

# #             # enqueue transcription task after DB commit
# #             transaction.on_commit(lambda: transcribe_session.delay(locked.id))

#         return Response(
#             {"detail": "Audio replaced. Transcription restarted.", "audio_id": new_audio.id},
#             status=status.HTTP_200_OK,
#         )
    
# # --------------------- AWS S3 MULTIPART UPLOADS ---------------------

#     @action(detail=True, methods=["post"], url_path="audio/multipart/start")
#     def audio_multipart_start(self, request, pk=None):
#         session = self.get_object()

#         if not getattr(settings, "USE_S3", False):
#             return Response({"detail": "S3 upload not enabled (USE_S3=1)."}, status=400)

#         with transaction.atomic():
#             locked = TherapySession.objects.select_for_update().get(pk=session.pk)

#             if SessionAudio.objects.filter(session=locked).exists():
#                 return Response({"detail": "Audio already exists for this session."}, status=409)

#             # If an upload exists and still uploading, you can either reuse or abort+restart
#             existing = getattr(locked, "audio_upload", None)
#             if existing and existing.status == "uploading":
#                 return Response(
#                     {"detail": "Multipart upload already started for this session.", "uploadId": existing.upload_id, "key": existing.s3_key, "partSize": MULTIPART_PART_SIZE},
#                     status=200,
#                 )

#             key = session_audio_key(locked, request.data.get("filename", "audio.webm"))

#             s3 = s3_client()
#             resp = s3.create_multipart_upload(
#                 Bucket=s3_bucket(),
#                 Key=key,
#                 ContentType=request.data.get("content_type") or "audio/webm",
#             )
#             upload_id = resp["UploadId"]

#             SessionAudioUpload.objects.update_or_create(
#                 session=locked,
#                 defaults={"s3_key": key, "upload_id": upload_id, "status": "uploading"},
#             )

#         return Response({"uploadId": upload_id, "key": key, "partSize": MULTIPART_PART_SIZE}, status=201)

#     @action(detail=True, methods=["post"], url_path="audio/multipart/presign")
#     def audio_multipart_presign(self, request, pk=None):
#         session = self.get_object()

#         if not getattr(settings, "USE_S3", False):
#             return Response({"detail": "S3 upload not enabled (USE_S3=1)."}, status=400)

#         ser = MultipartPresignSerializer(data=request.data)
#         ser.is_valid(raise_exception=True)

#         upload_id = ser.validated_data["uploadId"]
#         part_number = ser.validated_data["partNumber"]

#         upload = getattr(session, "audio_upload", None)
#         if not upload or upload.status != "uploading" or upload.upload_id != upload_id:
#             return Response({"detail": "No active multipart upload for this session."}, status=404)

#         s3 = s3_client()
#         url = s3.generate_presigned_url(
#             ClientMethod="upload_part",
#             Params={
#                 "Bucket": s3_bucket(),
#                 "Key": upload.s3_key,
#                 "UploadId": upload_id,
#                 "PartNumber": part_number,
#             },
#             ExpiresIn=60 * 10,  # 10 minutes
#         )
#         return Response({"url": url, "partNumber": part_number}, status=200)

#     @action(detail=True, methods=["post"], url_path="audio/multipart/complete")
#     def audio_multipart_complete(self, request, pk=None):
#         session = self.get_object()

#         if not getattr(settings, "USE_S3", False):
#             return Response({"detail": "S3 upload not enabled (USE_S3=1)."}, status=400)

#         ser = MultipartCompleteSerializer(data=request.data)
#         ser.is_valid(raise_exception=True)

#         upload_id = ser.validated_data["uploadId"]
#         parts = ser.validated_data["parts"]
#         parts_sorted = sorted(parts, key=lambda p: p["PartNumber"])

#         with transaction.atomic():
#             locked = TherapySession.objects.select_for_update().get(pk=session.pk)

#             if SessionAudio.objects.filter(session=locked).exists():
#                 return Response({"detail": "Audio already exists for this session."}, status=409)

#             upload = getattr(locked, "audio_upload", None)
#             if not upload or upload.status != "uploading" or upload.upload_id != upload_id:
#                 return Response({"detail": "No active multipart upload for this session."}, status=404)

#             s3 = s3_client()
#             s3.complete_multipart_upload(
#                 Bucket=s3_bucket(),
#                 Key=upload.s3_key,
#                 UploadId=upload_id,
#                 MultipartUpload={"Parts": parts_sorted},
#             )

#             # Create the final SessionAudio record.
#             # With django-storages default storage = S3, FileField stores the key string.
#             audio = SessionAudio.objects.create(
#                 session=locked,
#                 audio_file=upload.s3_key,  # <- key string works with S3Storage
#                 original_filename=(request.data.get("original_filename") or "")[:255],
#                 language_code=(request.data.get("language_code") or "")[:10],
#             )

#             upload.status = "completed"
#             upload.save(update_fields=["status"])

#             locked.status = "transcribing"
#             locked.last_error_stage = ""
#             locked.last_error_message = ""
#             locked.save(update_fields=["status", "last_error_stage", "last_error_message", "updated_at"])

#             transaction.on_commit(lambda: transcribe_session.delay(locked.id))

#         return Response({"detail": "Upload completed. Transcription started.", "audio_id": audio.id}, status=201)

#     @action(detail=True, methods=["post"], url_path="audio/multipart/abort")
#     def audio_multipart_abort(self, request, pk=None):
#         session = self.get_object()

#         if not getattr(settings, "USE_S3", False):
#             return Response({"detail": "S3 upload not enabled (USE_S3=1)."}, status=400)

#         upload = getattr(session, "audio_upload", None)
#         if not upload or upload.status != "uploading":
#             return Response({"detail": "No active multipart upload."}, status=404)

#         s3 = s3_client()
#         s3.abort_multipart_upload(
#             Bucket=s3_bucket(),
#             Key=upload.s3_key,
#             UploadId=upload.upload_id,
#         )
#         upload.status = "aborted"
#         upload.save(update_fields=["status"])

#         return Response({"detail": "Multipart upload aborted."}, status=200)

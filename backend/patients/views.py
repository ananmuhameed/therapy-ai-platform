from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError as DjangoValidationError


from .models import Patient
from .serializers import PatientSerializer
from .permissions import IsTherapist, IsOwnerTherapist
from users.permissions import IsTherapistProfileCompleted

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsTherapist, IsOwnerTherapist, IsTherapistProfileCompleted]

    def get_queryset(self):
        return Patient.objects.select_related("therapist").filter(therapist=self.request.user)

    def perform_create(self, serializer):
        try:
            serializer.save(therapist=self.request.user)
        except DjangoValidationError as e:
            errors = e.message_dict

            if "__all__" in errors:
                msgs = errors["__all__"]
                out = {}

                for msg in msgs:
                    s = str(msg).lower()
                    if "patient id" in s:
                        out["patient_id"] = ["National ID already exists for one of your patients."]
                    elif "contact phone" in s:
                        out["contact_phone"] = ["Phone number already exists for one of your patients."]
                    elif "contact email" in s:
                        out["contact_email"] = ["Email already exists for one of your patients."]
                    else:
                        out.setdefault("non_field_errors", []).append(str(msg))

                raise serializers.ValidationError(out)

            raise serializers.ValidationError(errors)

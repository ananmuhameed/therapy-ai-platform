from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

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
        serializer.save(therapist=self.request.user)

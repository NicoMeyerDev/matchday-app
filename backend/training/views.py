from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from clubs.models import Club
from .models import Training, TrainingsBlock
from .serializers import TrainingSerializer, TrainingsBlockSerializer

class TrainingViewSet(ModelViewSet):
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Training.objects.filter(club__owner=self.request.user)

class TrainingsBlockViewSet(ModelViewSet):
    serializer_class = TrainingsBlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TrainingsBlock.objects.filter(training=self.kwargs['training_pk'])

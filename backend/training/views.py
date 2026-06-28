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
    
    def perform_create(self, serializer):
        club = Club.objects.filter(owner=self.request.user).first()
        training = serializer.save(club = club)
        
        if training.trainingsart == 'klassisch':
            TrainingsBlock.objects.create(training = training, name = 'Aktivierung/Erwärmung' , trainingstyp = 'aktivierung', reihenfolge = 1)
            TrainingsBlock.objects.create(training = training, name = 'Spielform_1', trainingstyp = 'spielform_1', reihenfolge = 2)
            TrainingsBlock.objects.create(training = training, name = 'Zwischenblock', trainingstyp = 'zwischenblock', reihenfolge = 3)
            TrainingsBlock.objects.create(training = training, name = 'Spielform_2', trainingstyp = 'spielform_2', reihenfolge = 4)
            


class TrainingsBlockViewSet(ModelViewSet):
    serializer_class = TrainingsBlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        training_id = self.request.query_params.get('training')
        qs = TrainingsBlock.objects.filter(training__club__owner=self.request.user)
        if training_id:
            qs = qs.filter(training_id=training_id)
        return qs

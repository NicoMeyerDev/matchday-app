"""API-Views für die CRUD-Operationen der Spieler."""
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from clubs.models import Club
from .models import Player
from .serializers import PlayerSerializer


class PlayerViewSet(ModelViewSet):
    """
    Stellt Endpunkte zum Auflisten, Anlegen, Abrufen, Ändern und Löschen von Spielern bereit.

    Das DRF ModelViewSet hält das MVP kompakt und erzeugt trotzdem eine saubere
    REST-Struktur.
    """

    queryset = Player.objects.all().order_by('shirt_number', 'name')
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        clubs = Club.objects.filter(owner=user) | Club.objects.filter(members=user)
        return Player.objects.filter(club__in=clubs).order_by('shirt_number', 'name')
    
    def perform_create(self, serializer):
        club = Club.objects.filter(owner=self.request.user).first()
        serializer.save(club=club)
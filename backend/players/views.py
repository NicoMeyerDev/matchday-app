"""API-Views für die CRUD-Operationen der Spieler."""
from rest_framework.viewsets import ModelViewSet
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

"""API-Views für die Verwaltung von Aufstellungen."""
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import request, viewsets

import clubs
from clubs.models import Club
from .models import Lineup, LineupSlot, LineupSubstitute
from .serializers import LineupSerializer, LineupSlotSerializer, LineupSubstituteSerializer


class LineupViewSet(ModelViewSet):
    """
    Stellt CRUD-Endpunkte für komplette Spieltagsaufstellungen bereit.

    Zusätzliche eigene Endpunkte werden genutzt, um Spieler Positionen zuzuweisen
    und Ersatzspieler hinzuzufügen. Dadurch bleiben die Frontend-API-Aufrufe leicht verständlich.
    """

    queryset = Lineup.objects.select_related('formation').prefetch_related(
        'slots__position', 'slots__player', 'substitutes__player'
    ).all().order_by('-updated_at')
    serializer_class = LineupSerializer

    @action(detail=True, methods=['post'])
    def assign_player(self, request, pk=None):
        """
        Weist in der gewählten Aufstellung einen Spieler einer Position zu.

        Erwartetes JSON:
        {"position": 1, "player": 2, "instruction": "Hoch pressen"}
        """
        lineup = self.get_object()
        position_id = request.data.get('position')
        player_id = request.data.get('player')
        instruction = request.data.get('instruction', '')

        slot, _created = LineupSlot.objects.update_or_create(
            lineup=lineup,
            position_id=position_id,
            defaults={'player_id': player_id, 'instruction': instruction},
        )
        return Response(LineupSlotSerializer(slot).data)

    @action(detail=True, methods=['post'])
    def add_substitute(self, request, pk=None):
        """
        Fügt einen Spieler zur Bank der gewählten Aufstellung hinzu.

        Erwartetes JSON:
        {"player": 5, "note": "Option für linke Seite"}
        """
        lineup = self.get_object()
        substitute = LineupSubstitute.objects.create(
            lineup=lineup,
            player_id=request.data.get('player'),
            note=request.data.get('note', ''),
        )
        return Response(LineupSubstituteSerializer(substitute).data)
    
    def get_queryset(self):
        user = self.request.user
        clubs = Club.objects.filter(owner=user) | Club.objects.filter(members=user)
        return Lineup.objects.filter(club__in=clubs).select_related('formation').prefetch_related(
        'slots__position', 'slots__player', 'substitutes__player'
        ).order_by('-updated_at')

    def perform_create(self, serializer):
        club = Club.objects.filter(owner=self.request.user).first()
        serializer.save(club=club)


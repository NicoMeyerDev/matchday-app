from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from clubs.models import Club
from .models import MatchEvent, MatchReport
from .serializers import MatchEventSerializer, MatchReportSerializer

class MatchReportViewSet(viewsets.ModelViewSet):
    """
    Stellt die API-Endpunkte für Spielberichte bereit.

    Jeder Spielbericht ist mit einer Aufstellung verknüpft und enthält Informationen
    über den Gegner, das Ergebnis und Notizen zum Spiel.
    """

    queryset = MatchReport.objects.select_related('lineup').all().order_by('-updated_at')
    serializer_class = MatchReportSerializer


    def get_queryset(self):
        user = self.request.user
        clubs = Club.objects.filter(owner=user) | Club.objects.filter(members=user)
        return MatchReport.objects.filter(lineup__club__in=clubs).select_related('lineup').all().order_by('-updated_at')
    
    def perform_create(self, serializer):
        club = Club.objects.filter(owner=self.request.user).first()
        serializer.save(club=club)

class MatchEventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] 
 
    """
    Stellt die API-Endpunkte für Spielereignisse bereit.

    Jedes Ereignis ist mit einem Spielbericht verknüpft und enthält Informationen
    über die Minute, die Art des Ereignisses, beteiligte Spieler und eine Beschreibung.
    """

    queryset = MatchEvent.objects.select_related('player', 'match_report').all().order_by('-created_at')
    serializer_class = MatchEventSerializer        
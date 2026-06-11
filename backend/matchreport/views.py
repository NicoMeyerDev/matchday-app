from django.shortcuts import render
from rest_framework import viewsets
from .models import MatchReport
from .serializers import MatchReportSerializer

class MatchReportViewSet(viewsets.ModelViewSet):
    """
    Stellt die API-Endpunkte für Spielberichte bereit.

    Jeder Spielbericht ist mit einer Aufstellung verknüpft und enthält Informationen
    über den Gegner, das Ergebnis und Notizen zum Spiel.
    """

    queryset = MatchReport.objects.select_related('lineup').all().order_by('-updated_at')
    serializer_class = MatchReportSerializer



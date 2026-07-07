from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from clubs.models import Club
from .models import MatchEvent, MatchReport
from .serializers import MatchEventSerializer, MatchReportSerializer


class MatchReportViewSet(viewsets.ModelViewSet):
    """
    Stellt die API-Endpunkte für Spielberichte bereit.

    Jeder Spielbericht ist mit einer Aufstellung verknüpft und enthält Informationen
    über den Gegner, das Ergebnis und Notizen zum Spiel.
    """

    queryset = (
        MatchReport.objects.select_related("lineup").all().order_by("-updated_at")
    )
    serializer_class = MatchReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        clubs = Club.objects.filter(owner=user) | Club.objects.filter(members=user)
        return (
            MatchReport.objects.filter(lineup__club__in=clubs)
            .select_related("lineup")
            .all()
            .order_by("-updated_at")
        )

    def perform_create(self, serializer):
        club = Club.objects.filter(owner=self.request.user).first()
        serializer.save(club=club)

    @action(detail=True, methods=["post"], url_path="finalize")
    def finalize(self, request, pk=None):
        """Zählt Tor-Events und schreibt das Ergebnis (z.B. '3:1') in result."""
        report = self.get_object()
        goals_for = report.events.filter(event_type="tor", for_us=True).count()
        goals_against = report.events.filter(event_type="tor", for_us=False).count()
        report.result = f"{goals_for}:{goals_against}"
        report.save(update_fields=["result", "updated_at"])
        return Response(MatchReportSerializer(report).data)


class MatchEventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    """
    Stellt die API-Endpunkte für Spielereignisse bereit.

    Jedes Ereignis ist mit einem Spielbericht verknüpft und enthält Informationen
    über die Minute, die Art des Ereignisses, beteiligte Spieler und eine Beschreibung.
    """

    queryset = (
        MatchEvent.objects.select_related("player", "match_report")
        .all()
        .order_by("-created_at")
    )
    serializer_class = MatchEventSerializer

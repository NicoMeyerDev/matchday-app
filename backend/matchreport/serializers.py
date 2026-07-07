from rest_framework import serializers
from lineups.serializers import LineupSerializer
from players.serializers import PlayerSerializer
from .models import MatchEvent, MatchReport


class MatchEventSerializer(serializers.ModelSerializer):
    """
    Wandelt ein Spielereignis in JSON um.

    Der Serializer zeigt:
    - die Minute des Ereignisses
    - die Art des Ereignisses (z.B. Tor, Karte)
    - ob es für unser Team war
    - die beteiligten Spieler
    - eine Beschreibung des Ereignisses
    """

    player_detail = PlayerSerializer(source="player", read_only=True)

    class Meta:
        model = MatchEvent
        fields = [
            "id",
            "match_report",
            "minute",
            "event_type",
            "for_us",
            "card_type",
            "player",
            "player_detail",
            "description",
            "created_at",
        ]


class MatchReportSerializer(serializers.ModelSerializer):
    """
    Wandelt einen Spielbericht in JSON um.

    Der Serializer zeigt:
    - die zugehörige Aufstellung mit Details
    - den Gegner
    - das Ergebnis
    - Notizen zum Spiel
    """

    lineup_detail = LineupSerializer(source="lineup", read_only=True)
    events = MatchEventSerializer(many=True, read_only=True)

    class Meta:
        model = MatchReport
        fields = [
            "id",
            "lineup",
            "lineup_detail",
            "opponent",
            "events",
            "result",
            "notes",
            "created_at",
            "updated_at",
        ]

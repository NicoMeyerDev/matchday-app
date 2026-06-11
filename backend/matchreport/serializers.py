from rest_framework import serializers
from formations.serializers import FormationSerializer  
from lineups.serializers import LineupSerializer
from players.serializers import PlayerSerializer
from .models import MatchReport

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

    class Meta:
        model = MatchReport
        fields = ["id", "lineup", "lineup_detail", "opponent", "result", "notes", "created_at", "updated_at"]

"""Serializer für Aufstellungen, Feldpositionen und Ersatzspieler."""

from rest_framework import serializers
from formations.serializers import FormationSerializer, FormationPositionSerializer
from players.serializers import PlayerSerializer
from .models import Lineup, LineupSlot, LineupSubstitute


class LineupSlotSerializer(serializers.ModelSerializer):
    """
    Wandelt eine einzelne Feldzuweisung in JSON um.

    Eine Feldzuweisung verbindet:
    - eine Position innerhalb der Formation
    - einen Spieler
    - eine optionale Anweisung
    """

    position_detail = FormationPositionSerializer(source="position", read_only=True)
    player_detail = PlayerSerializer(source="player", read_only=True)

    class Meta:
        model = LineupSlot
        fields = [
            "id",
            "position",
            "position_detail",
            "player",
            "player_detail",
            "instruction",
        ]


class LineupSubstituteSerializer(serializers.ModelSerializer):
    """
    Wandelt einen Ersatzspieler-Eintrag in JSON um.

    Ein Ersatzspieler-Eintrag verbindet:
    - einen Spieler
    - eine optionale Notiz
    """

    player_detail = PlayerSerializer(source="player", read_only=True)

    class Meta:
        model = LineupSubstitute
        fields = [
            "id",
            "player",
            "player_detail",
            "note",
        ]


class LineupSerializer(serializers.ModelSerializer):
    """
    Wandelt eine komplette Spieltagsaufstellung in JSON um.

    Der Serializer kann:
    - eine Aufstellung anzeigen
    - eine neue Aufstellung mit Slots und Ersatzspielern erstellen
    - eine bestehende Aufstellung komplett aktualisieren

    Beim Aktualisieren werden die alten Slots und Ersatzspieler gelöscht
    und durch die neu gesendeten Daten ersetzt.
    Das ist für das MVP einfacher und stabiler als einzelne Slot-Updates.
    """

    formation_detail = FormationSerializer(source="formation", read_only=True)
    slots = LineupSlotSerializer(many=True, required=False)
    substitutes = LineupSubstituteSerializer(many=True, required=False)

    class Meta:
        model = Lineup
        fields = [
            "id",
            "title",
            "opponent",
            "formation",
            "formation_detail",
            "general_notes",
            "slots",
            "substitutes",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        """
        Prüft, ob ein Spieler gleichzeitig in der Startelf und auf der Bank ist.
        """
        slots_data = data.get("slots", [])
        substitutes_data = data.get("substitutes", [])

        player_ids_in_slots = {slot_data["player"] for slot_data in slots_data}
        player_ids_in_substitutes = {
            substitute_data["player"] for substitute_data in substitutes_data
        }

        if player_ids_in_slots & player_ids_in_substitutes:
            raise serializers.ValidationError(
                "Ein Spieler kann nicht gleichzeitig in der Startelf und auf "
                "der Bank sein."
            )

        return data

    def create(self, validated_data):
        """
        Erstellt eine neue Aufstellung inklusive Feldpositionen und Ersatzspielern.

        Ablauf:
        1. Slots und Ersatzspieler aus den validierten Daten herausnehmen
        2. Aufstellung erstellen
        3. Feldpositionen zur Aufstellung anlegen
        4. Ersatzspieler zur Aufstellung anlegen
        5. fertige Aufstellung zurückgeben
        """

        slots_data = validated_data.pop("slots", [])
        substitutes_data = validated_data.pop("substitutes", [])

        lineup = Lineup.objects.create(**validated_data)

        for slot_data in slots_data:
            LineupSlot.objects.create(lineup=lineup, **slot_data)

        for substitute_data in substitutes_data:
            LineupSubstitute.objects.create(lineup=lineup, **substitute_data)

        return lineup

    def update(self, instance, validated_data):
        """
        Aktualisiert eine bestehende Aufstellung vollständig.

        Ablauf:
        1. Slots und Ersatzspieler aus den validierten Daten herausnehmen
        2. normale Aufstellungsfelder aktualisieren
        3. alte Slots löschen
        4. alte Ersatzspieler löschen
        5. neue Slots anlegen
        6. neue Ersatzspieler anlegen
        7. aktualisierte Aufstellung zurückgeben
        """

        slots_data = validated_data.pop("slots", [])
        substitutes_data = validated_data.pop("substitutes", [])

        instance.title = validated_data.get("title", instance.title)
        instance.opponent = validated_data.get("opponent", instance.opponent)
        instance.formation = validated_data.get("formation", instance.formation)
        instance.general_notes = validated_data.get(
            "general_notes",
            instance.general_notes,
        )
        instance.save()

        instance.slots.all().delete()
        instance.substitutes.all().delete()

        for slot_data in slots_data:
            LineupSlot.objects.create(lineup=instance, **slot_data)

        for substitute_data in substitutes_data:
            LineupSubstitute.objects.create(lineup=instance, **substitute_data)

        return instance

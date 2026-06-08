"""Serializer für Formationen und ihre Spielfeldpositionen."""
from rest_framework import serializers
from .models import Formation, FormationPosition


class FormationPositionSerializer(serializers.ModelSerializer):
    """Wandelt eine Formationsposition in JSON für das Spielfeld-UI um."""

    class Meta:
        model = FormationPosition
        fields = ['id', 'label', 'x', 'y']


class FormationSerializer(serializers.ModelSerializer):
    """
    Wandelt eine Formation inklusive aller zugehörigen Positionen in JSON um.

    Die verschachtelten Positionen ermöglichen dem Frontend, die komplette Formation
    mit einem einzigen API-Aufruf zu zeichnen.
    """

    positions = FormationPositionSerializer(many=True, read_only=True)

    class Meta:
        model = Formation
        fields = ['id', 'name', 'description', 'positions']

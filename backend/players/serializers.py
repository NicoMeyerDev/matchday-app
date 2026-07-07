"""Serializer wandeln Spieler-Daten zwischen Django-Modell und JSON um."""

from rest_framework import serializers
from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    """
    API-Serializer für Spieler.

    Wird vom Frontend genutzt, um Spieler aufzulisten, anzulegen, zu ändern
    und zu löschen.
    """

    class Meta:
        model = Player
        fields = "__all__"
        read_only_fields = ["created_at", "club"]

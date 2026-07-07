"""Datenbankmodelle für Spieltagsaufstellungen und taktische Notizen."""

from django.db import models
from formations.models import Formation, FormationPosition
from players.models import Player


class Lineup(models.Model):
    """
    Speichert ein Spieltags-Board.

    Eine Aufstellung verbindet eine gewählte Formation mit zugewiesenen Spielern,
    Ersatzspielern und allgemeinen Trainer-Notizen.
    """

    club = models.ForeignKey(
        "clubs.Club", on_delete=models.CASCADE, related_name="lineups"
    )
    title = models.CharField(max_length=120)
    opponent = models.CharField(max_length=120, blank=True)
    formation = models.ForeignKey(Formation, on_delete=models.PROTECT)
    general_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Gibt den Titel der Aufstellung für Admin und Debugging zurück."""
        return self.title


class LineupSlot(models.Model):
    """
    Weist einem Spieler eine Formationsposition innerhalb einer Aufstellung zu.

    Diese Tabelle verbindet die taktische Position mit dem echten Spieler.
    """

    lineup = models.ForeignKey(Lineup, related_name="slots", on_delete=models.CASCADE)
    position = models.ForeignKey(FormationPosition, on_delete=models.PROTECT)
    player = models.ForeignKey(Player, null=True, blank=True, on_delete=models.SET_NULL)
    instruction = models.TextField(blank=True)

    class Meta:
        unique_together = ["lineup", "position"]

    def __str__(self):
        """Gibt eine lesbare Positionszuweisung für Admin und Debugging zurück."""
        player_name = self.player.name if self.player else "empty"
        return f"{self.position.label}: {player_name}"


class LineupSubstitute(models.Model):
    """
    Speichert Ersatzspieler für eine Aufstellung.

    Ersatzspieler getrennt von Feldpositionen zu halten macht das MVP einfacher
    und verhindert, dass eine Tabelle zwei verschiedene taktische Bedeutungen bekommt.
    """

    lineup = models.ForeignKey(
        Lineup, related_name="substitutes", on_delete=models.CASCADE
    )
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    note = models.TextField(blank=True)

    def __str__(self):
        """Gibt den Namen des Ersatzspielers für Admin und Debugging zurück."""
        return self.player.name

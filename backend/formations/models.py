"""Datenbankmodelle für wiederverwendbare Fußballformationen."""
from django.db import models


class Formation(models.Model):
    """
    Speichert eine taktische Formation, zum Beispiel 4-4-2 oder 4-3-3.

    Das Frontend nutzt die zugehörigen Positionen, um klickbare Punkte
    auf dem Spielfeld darzustellen.
    """

    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        """Gibt den Formationsnamen für Admin und Debugging zurück."""
        return self.name


class FormationPosition(models.Model):
    """
    Speichert eine einzelne Position innerhalb einer Formation.

    x und y sind Prozentkoordinaten für das Spielfeld im Frontend.
    Beispiel: x=50, y=90 bedeutet zentral und nah am eigenen Tor.
    """

    formation = models.ForeignKey(Formation, related_name='positions', on_delete=models.CASCADE)
    label = models.CharField(max_length=30)
    x = models.PositiveIntegerField()
    y = models.PositiveIntegerField()

    class Meta:
        ordering = ['y', 'x']

    def __str__(self):
        """Gibt Positionsbezeichnung und Formation für leichteres Debugging zurück."""
        return f'{self.formation.name} - {self.label}'

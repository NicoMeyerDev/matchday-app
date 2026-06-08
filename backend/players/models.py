"""Datenbankmodelle für die Spielerverwaltung."""
from django.db import models


class Player(models.Model):
    """
    Speichert einen Fußballspieler für das MVP.

    Das Modell ist klein gehalten: Name, Rückennummer, bevorzugte Positionen
    und Notizen reichen für ein erstes nutzbares Coaching-Board aus.
    """

    name = models.CharField(max_length=120)
    shirt_number = models.PositiveIntegerField(null=True, blank=True)
    preferred_positions = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    """Gibt einen lesbaren Namen für Django-Admin und Debugging zurück."""
    def __str__(self):
        
        return self.name

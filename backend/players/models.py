"""Datenbankmodelle für die Spielerverwaltung."""

from django.db import models


class Player(models.Model):
    """
    Speichert einen Fußballspieler für das MVP.

    Das Modell ist klein gehalten: Name, Rückennummer, bevorzugte Positionen
    und Notizen reichen für ein erstes nutzbares Coaching-Board aus.
    """

    club = models.ForeignKey(
        "clubs.Club", related_name="players", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=120)
    shirt_number = models.PositiveIntegerField(null=True, blank=True)
    preferred_positions = models.CharField(max_length=120, blank=True)
    foot = models.CharField(
        max_length=10,
        blank=True,
        choices=[("left", "Links"), ("right", "Rechts"), ("both", "Beidfüßig")],
    )
    status = models.CharField(
        max_length=20,
        blank=True,
        default="available",
        choices=[
            ("available", "Verfügbar"),
            ("injured", "Verletzt"),
            ("doubtful", "Zweifelhaft"),
            ("suspended", "Gesperrt"),
        ],
    )
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Technisch (Feldspieler)
    attr_passspiel = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_schuss = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_dribbling = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_ballkontrolle = models.PositiveSmallIntegerField(null=True, blank=True)
    # Technisch (Torhüter)
    attr_abschlag = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_reflexe = models.PositiveSmallIntegerField(null=True, blank=True)
    # Mental
    attr_einsatz = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_entscheidung = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_konzentration = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_teamwork = models.PositiveSmallIntegerField(null=True, blank=True)
    # Physisch
    attr_schnelligkeit = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_ausdauer = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_zweikampfstaerke = models.PositiveSmallIntegerField(null=True, blank=True)
    attr_kraft = models.PositiveSmallIntegerField(null=True, blank=True)

    """Gibt einen lesbaren Namen für Django-Admin und Debugging zurück."""

    def __str__(self):

        return self.name

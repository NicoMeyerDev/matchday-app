"""Erstellt Beispielformationen für lokale MVP-Tests."""

from django.core.management.base import BaseCommand
from formations.models import Formation, FormationPosition

FORMATIONS = {
    "4-4-2": [
        ("TW", 50, 92),
        ("LV", 20, 75),
        ("IVL", 40, 75),
        ("IVR", 60, 75),
        ("RV", 80, 75),
        ("LM", 20, 52),
        ("ZML", 40, 52),
        ("ZMR", 60, 52),
        ("RM", 80, 52),
        ("STL", 45, 25),
        ("STR", 55, 25),
    ],
    "4-3-3": [
        ("TW", 50, 92),
        ("LV", 20, 75),
        ("IVL", 40, 75),
        ("IVR", 60, 75),
        ("RV", 80, 75),
        ("ZDM", 50, 58),
        ("ZML", 35, 45),
        ("ZMR", 65, 45),
        ("LF", 25, 25),
        ("ST", 50, 20),
        ("RF", 75, 25),
    ],
    "4-2-3-1": [
        ("TW", 50, 92),
        ("LV", 20, 75),
        ("IVL", 40, 75),
        ("IVR", 60, 75),
        ("RV", 80, 75),
        ("ZDML", 40, 60),
        ("ZDMR", 60, 60),
        ("LM", 20, 40),
        ("OM", 50, 38),
        ("RM", 80, 40),
        ("ST", 50, 20),
    ],
    "3-5-2": [
        ("TW", 50, 92),
        ("IVL", 35, 75),
        ("IV", 50, 78),
        ("IVR", 65, 75),
        ("LM", 20, 55),
        ("ZML", 40, 50),
        ("ZMR", 60, 50),
        ("RM", 80, 55),
        ("OM", 50, 35),
        ("STL", 45, 20),
        ("STR", 55, 20),
    ],
    "5-3-2": [
        ("TW", 50, 92),
        ("LV", 15, 75),
        ("IVL", 35, 78),
        ("IV", 50, 80),
        ("IVR", 65, 78),
        ("RV", 85, 75),
        ("ZML", 35, 50),
        ("ZM", 50, 45),
        ("ZMR", 65, 50),
        ("STL", 45, 25),
        ("STR", 55, 25),
    ],
}


class Command(BaseCommand):
    """
    Legt vordefinierte Formationen und Spielfeldkoordinaten an.

    Start mit: python manage.py seed_formations
    """

    help = "Standard-Fußballformationen für das MVP anlegen."

    def handle(self, *args, **options):
        """Erstellt oder aktualisiert vordefinierte Formationen."""
        for formation_name, positions in FORMATIONS.items():
            formation, _created = Formation.objects.get_or_create(name=formation_name)
            if not formation.positions.exists():
                for label, x, y in positions:
                    FormationPosition.objects.create(
                        formation=formation,
                        label=label,
                        x=x,
                        y=y,
                    )
        self.stdout.write(self.style.SUCCESS("Standardformationen wurden erstellt."))

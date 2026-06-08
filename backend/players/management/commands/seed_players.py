"""Erstellt Beispielspieler für lokale MVP-Tests."""
from django.core.management.base import BaseCommand
from players.models import Player


EXAMPLE_PLAYERS = [
    ('Müller', 1, 'TW'), ('Schmidt', 4, 'IV, RV'), ('Kaya', 5, 'IV'),
    ('Weber', 3, 'LV'), ('Neumann', 2, 'RV'), ('Fischer', 6, 'ZDM'),
    ('Wolf', 8, 'ZM'), ('Brandt', 10, 'ZM, OM'), ('Yilmaz', 7, 'RF'),
    ('Becker', 11, 'LF'), ('Hoffmann', 9, 'ST'), ('Krüger', 14, 'ST, LF'),
    ('Schulz', 15, 'ZM'), ('Richter', 16, 'LV, LM'),
]


class Command(BaseCommand):
    """
    Legt Beispielspieler für schnelle lokale Tests an.

    Start mit: python manage.py seed_players
    """

    help = 'Beispielspieler für das MVP anlegen.'

    def handle(self, *args, **options):
        """Erstellt Demospieler, ohne bereits vorhandene Namen zu duplizieren."""
        for name, number, positions in EXAMPLE_PLAYERS:
            Player.objects.get_or_create(
                name=name,
                defaults={'shirt_number': number, 'preferred_positions': positions},
            )
        self.stdout.write(self.style.SUCCESS('Beispielspieler wurden erstellt.'))

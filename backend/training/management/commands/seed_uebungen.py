"""Management Command: Übungsdatenbank mit Beispieldaten befüllen."""
from django.core.management.base import BaseCommand

from clubs.models import Club
from training.models import Category, Uebung


SEED_DATA = {
    'Aufwärmen': [
        {'name': 'Laufen & Dehnen', 'description': 'Lockeres Einlaufen mit dynamischem Dehnen zur Aktivierung der Muskulatur.', 'duration': 10, 'player_count': 'Gruppe'},
        {'name': 'Koordinationsleiter', 'description': 'Koordinationsübung durch die Stufenleiter zur Verbesserung der Schnelligkeit.', 'duration': 10, 'player_count': 'Gruppe'},
        {'name': 'Ballgewöhnung', 'description': 'Freie Ballarbeit zur Gewöhnung an den Ball vor dem Training.', 'duration': 10, 'player_count': 'Gruppe'},
        {'name': 'Rondo 4v2 locker', 'description': 'Entspanntes Kurzpass-Spiel im Kreis zur spielerischen Erwärmung.', 'duration': 12, 'player_count': '4v2'},
        {'name': 'Passstafette aufwärmen', 'description': 'Passstafette in zwei Gruppen zur technischen Erwärmung.', 'duration': 10, 'player_count': 'Gruppe'},
    ],
    'Passspiel': [
        {'name': 'Passstafette 4v2', 'description': 'Klassisches Rondo im 4 gegen 2 zur Schulung des Kurzpassspiels.', 'duration': 15, 'player_count': '4v2'},
        {'name': 'Rondo 5v2', 'description': 'Fünf Außenspieler gegen zwei Verteidiger im engen Raum.', 'duration': 15, 'player_count': '5v2'},
        {'name': 'Kombination 3er-Gruppe', 'description': 'Dreieckspass mit anschließendem Positionswechsel.', 'duration': 15, 'player_count': '3er'},
        {'name': 'Flügelspiel mit Einleitung', 'description': 'Passspiel über den Flügel mit einleitendem Mittelfeldspieler.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': 'Doppelpass & Tiefenlauf', 'description': 'Kombination über den Doppelpass mit anschließendem Tiefenlauf in den freien Raum.', 'duration': 15, 'player_count': 'Gruppe'},
    ],
    'Abschluss': [
        {'name': 'Torabschluss nach Kombination', 'description': 'Abschluss auf das Tor nach vorheriger Kombinationsübung.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': 'Abschluss nach Dribbling', 'description': 'Torschuss nach abgeschlossenem Dribbling am Verteidiger vorbei.', 'duration': 15, 'player_count': 'Gruppe'},
        {'name': 'Flügelspiel mit Abschluss', 'description': 'Flanke vom Flügel mit Abschluss im Zentrum.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': '1v1 mit Abschluss', 'description': 'Eins gegen eins mit abschließendem Torschuss nach Überwindung des Verteidigers.', 'duration': 15, 'player_count': '1v1'},
        {'name': 'Standardsituation Ecke', 'description': 'Eingeübte Eckball-Variante mit Abschluss aus dem Rückraum.', 'duration': 15, 'player_count': 'Gruppe'},
    ],
    'Pressing': [
        {'name': 'Pressing 6v6', 'description': 'Intensives Pressing-Spiel im 6 gegen 6 auf engem Raum.', 'duration': 20, 'player_count': '6v6'},
        {'name': 'Gegenpressing nach Ballverlust', 'description': 'Sofortiges Gegenpressing nach Ballverlust zur schnellen Rückeroberung.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': 'Angriffspressing 4v4', 'description': 'Aggressives Angriffspressing im 4 gegen 4 mit Torabschluss.', 'duration': 15, 'player_count': '4v4'},
        {'name': 'Mittelfeldpressing mit Auslöser', 'description': 'Koordiniertes Mittelfeldpressing mit definiertem Auslösesignal.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': 'Kompaktes Defensivpressing', 'description': 'Kompakter Defensivblock mit Pressing-Auslöser bei Ballkontakt.', 'duration': 20, 'player_count': 'Gruppe'},
    ],
    'Zweikampf': [
        {'name': '1v1 Defensiv', 'description': 'Verteidigungsduell eins gegen eins mit Fokus auf Stellungsspiel.', 'duration': 10, 'player_count': '1v1'},
        {'name': '1v1 Offensiv', 'description': 'Angriffseins gegen eins mit Abschluss nach Überwindung des Gegners.', 'duration': 10, 'player_count': '1v1'},
        {'name': '2v1 Überzahl', 'description': 'Überzahlsituation zwei gegen eins zum Ausspielen des Verteidigers.', 'duration': 15, 'player_count': '2v1'},
        {'name': 'Kopfballduell', 'description': 'Kopfballübung im direkten Duell zur Verbesserung der Kopfballtechnik.', 'duration': 10, 'player_count': 'Gruppe'},
        {'name': 'Grätsche & Stellungsspiel', 'description': 'Tacklingübung mit Fokus auf saubere Grätsche und optimales Stellungsspiel.', 'duration': 12, 'player_count': 'Gruppe'},
    ],
    'Technik': [
        {'name': 'Dribblingparcours', 'description': 'Dribbling durch Hütchen-Parcours zur Verbesserung der Ballkontrolle.', 'duration': 10, 'player_count': 'Einzeln'},
        {'name': 'Ballkontrolle unter Druck', 'description': 'Ball-Annahme und Kontrolle unter direktem gegnerischem Druck.', 'duration': 12, 'player_count': 'Einzeln'},
        {'name': 'Volleyschuss', 'description': 'Volleytorschuss aus der Bewegung zur Verbesserung der Schusstechnik.', 'duration': 10, 'player_count': 'Einzeln'},
        {'name': 'Innenseitstoß Präzision', 'description': 'Passgenaues Spielen mit dem Innenrist auf definierte Zielmarkierungen.', 'duration': 10, 'player_count': 'Einzeln'},
        {'name': 'Erste Berührung & Pass', 'description': 'Saubere Ballkontrolle mit direktem Weiterpass in einem flüssigen Bewegungsablauf.', 'duration': 12, 'player_count': 'Gruppe'},
    ],
    'Taktik': [
        {'name': 'Aufbau von hinten 3-2', 'description': 'Strukturierter Spielaufbau von der Abwehr mit Dreier- und Zweierkette.', 'duration': 20, 'player_count': '11v11'},
        {'name': 'Pressing auslösen', 'description': 'Taktisches Einüben des Pressing-Auslösers im Mannschaftsverbund.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': 'Überzahl ausspielen', 'description': 'Strukturiertes Ausspielen einer numerischen Überzahl durch Positionsspiel.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': 'Raumaufteilung Angriff', 'description': 'Optimale Raumnutzung im Angriff durch taktische Staffelung und Bewegung.', 'duration': 20, 'player_count': 'Gruppe'},
        {'name': 'Gegenpressing Struktur', 'description': 'Strukturiertes Gegenpressing mit klar definierten Aufgaben pro Position.', 'duration': 20, 'player_count': 'Gruppe'},
    ],
    'Standardsituation': [
        {'name': 'Freistoß direkt', 'description': 'Direkter Freistoßschuss auf das Tor aus verschiedenen Positionen.', 'duration': 15, 'player_count': 'Gruppe'},
        {'name': 'Eckball Variante 1', 'description': 'Eingeübte Eckball-Variante mit Laufwegen und Abschluss aus dem Rückraum.', 'duration': 15, 'player_count': 'Gruppe'},
        {'name': 'Einwurf schnell', 'description': 'Schneller Einwurf auf den mitgelaufenen Mitspieler zur Fortführung des Spiels.', 'duration': 10, 'player_count': 'Gruppe'},
        {'name': 'Freistoß Mauer', 'description': 'Freistoß mit eingeübten Laufwegen hinter der gegnerischen Mauer.', 'duration': 15, 'player_count': 'Gruppe'},
        {'name': 'Eckball kurz', 'description': 'Kurzer Eckball mit direkter Anschlusskombination in den Strafraum.', 'duration': 12, 'player_count': 'Gruppe'},
    ],
}


class Command(BaseCommand):
    """Befüllt die Übungsdatenbank mit Beispieldaten — idempotent."""

    help = 'Übungsdatenbank mit Beispieldaten befüllen (nur wenn noch keine Übungen vorhanden sind)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--club-id',
            type=int,
            help='Club-ID für die Übungen (Standard: erster Club in der Datenbank)',
        )

    def handle(self, *args, **options):
        if Uebung.objects.count() > 0:
            self.stdout.write(self.style.WARNING('Übungen bereits vorhanden — übersprungen.'))
            return

        club_id = options.get('club_id')
        if club_id:
            try:
                club = Club.objects.get(id=club_id)
            except Club.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'Club mit ID {club_id} nicht gefunden.'))
                return
        else:
            club = Club.objects.first()

        if not club:
            self.stderr.write(self.style.ERROR(
                'Kein Club gefunden. Bitte zuerst einen Club anlegen.'
            ))
            return

        self.stdout.write(f'Befülle Übungsdatenbank für Club: {club}')
        total = 0

        for category_name, exercises in SEED_DATA.items():
            category, _ = Category.objects.get_or_create(name=category_name)
            for ex in exercises:
                uebung, created = Uebung.objects.get_or_create(
                    club=club,
                    name=ex['name'],
                    defaults={
                        'description': ex['description'],
                        'duration': ex['duration'],
                        'player_count': ex['player_count'],
                    },
                )
                if created:
                    uebung.categories.add(category)
                    total += 1

        self.stdout.write(self.style.SUCCESS(f'{total} Übungen angelegt.'))

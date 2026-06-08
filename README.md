# Matchday Coaching App – MVP

## Ziel
Dieses MVP ist eine erste lauffähige Version einer tablet-tauglichen Coaching-App für Fußballtrainer.

Der Trainer kann:
- Spieler anzeigen
- Formation auswählen
- Spieler auf Positionen setzen
- Ersatzspieler auf die Bank setzen
- kurze Anweisungen speichern

Nicht enthalten:
- Login
- Rollen/Rechte
- Heatmaps
- Analysemodul
- KI-Funktionen
- Mehrvereinsfähigkeit

---

## Projektstruktur

```txt
matchday_mvp/
├── backend/
│   ├── core/
│   ├── players/
│   ├── formations/
│   ├── lineups/
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   └── styles/
    ├── index.html
    └── package.json
```

---

## Backend starten

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_formations
python manage.py seed_players
python manage.py runserver
```

Backend läuft dann unter:

```txt
http://localhost:8000/api/
```

Wichtige Endpunkte:

```txt
/api/players/
/api/formations/
/api/lineups/
```

---

## Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft dann unter:

```txt
http://localhost:5173
```

---

## MVP-Datenfluss

1. Frontend lädt Spieler und Formationen aus dem Backend.
2. Trainer wählt eine Formation.
3. Trainer wählt einen Spieler.
4. Trainer klickt eine Position auf dem Spielfeld.
5. Frontend zeigt die Zuweisung sofort an.
6. Backend speichert die Zuweisung in einer Lineup-Struktur.

---

## Wichtige Models

### Player
Speichert einzelne Spieler mit Name, Rückennummer, Positionen und Notizen.

### Formation
Speichert eine Formation wie 4-4-2 oder 4-3-3.

### FormationPosition
Speichert einzelne Positionen innerhalb einer Formation inklusive x/y-Koordinaten für das Spielfeld.

### Lineup
Speichert eine konkrete Aufstellung für ein Spiel.

### LineupSlot
Verbindet eine Position mit einem Spieler.

### LineupSubstitute
Speichert Ersatzspieler auf der Bank.

---

## Nächste sinnvolle Ausbaustufen

1. Drag & Drop statt Klick-Zuweisung
2. Spieler erstellen im Frontend
3. Lineup-Auswahl und mehrere Spiele
4. Wechselmodus: Spieler raus / Spieler rein
5. Login und Verein/Team-Struktur
6. Speicherung mehrerer Boards pro Spiel
7. Export als PDF oder Bild

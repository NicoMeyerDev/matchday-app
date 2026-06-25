# 🏟️ Matchday Coaching App

Eine tablet-optimierte Coaching-App für Fußballtrainer – entwickelt für den Einsatz direkt am Spielfeldrand.

🔗 **Live-Demo:** [matchday-app-lqai.onrender.com](https://matchday-app-lqai.onrender.com)

---

## Inhaltsverzeichnis

1. [Über das Projekt](#über-das-projekt)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Projektstruktur](#projektstruktur)
5. [Installation & Start](#installation--start)
6. [API-Endpunkte](#api-endpunkte)
7. [Datenmodelle](#datenmodelle)
8. [Roadmap](#roadmap)
9. [Tech Stack](#tech-stack)

---

## Über das Projekt

Die Matchday Coaching App unterstützt Fußballtrainer im Amateurfußball bei Spielvorbereitung, Aufstellungsplanung und Spieltagssteuerung. Der Kern der App (**USP**) ist das Live-Matchday-Modul mit Substitutions-Briefings, Spielzeit-Timer und Echtzeit-Spielsteuerung — direkt auf dem Tablet am Spielfeldrand.

Langfristig wächst die App zu einer Gesamtplattform für Vereinsverwaltung, Training, Taktik und Analyse.

**Tech-Stack:**
- **Backend:** Django REST Framework, PostgreSQL (Migration geplant), JWT-Auth via httpOnly-Cookies
- **Frontend:** React, Vite
- **Deployment:** Render

---

## Features

### Aktuell verfügbar

- **Authentifizierung** – Registrierung, Login und Logout mit JWT; Onboarding-Flow zum Verein erstellen
- **Kader** – Spielerverwaltung mit Rückennummer, Position, Kaderstatus und Attributen (Technisch / Mental / Physisch, Torwart-spezifische Overrides)
- **Vorbereitung** – Aufstellungsplanung mit Formation, Startelf und Bank; Spieleranweisungen; verletzte/gesperrte Spieler ausgeblendet
- **Matchday** – Live-Spieltagsansicht mit zeitstempel-basiertem 45-Min-Timer (robust gegen Tablet-Sperren), Wechseln, Wechsel-Briefing (FM-Look mit Animation), Torereignissen und Karten; Events werden laufend gespeichert (Crash-Schutz)
- **Post-Match** – Automatische Berichterstellung mit Spielergebnis aus Events, Notizen und Spieleranalyse
- **Trainingshub** – Trainingsplanung mit automatisch generierten Blöcken (Aktivierung / Spielform 1 / Zwischenblock / Spielform 2)

### Nicht enthalten (geplant)
- Rollen- und Rechtesystem (Trainer / Spieler-Accounts)
- Mehrvereinsfähigkeit / Multi-Tenant-Architektur
- KI-basierte Spielanalyse
- Taktikboard mit Zeichenfunktion

---

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Kader
![Kader](screenshots/kader.png)

### Vorbereitung
![Vorbereitung](screenshots/vorbereitung.png)

### Matchday
![Matchday](screenshots/matchday.png)

### Wechsel-Briefing
![Wechsel-Briefing](screenshots/briefing.png)

### Post-Match Bericht
![Post-Match](screenshots/postmatch.png)

### Trainingshub
![Trainingshub](screenshots/trainingshub.png)

---

## Projektstruktur

```
matchday_mvp/
├── backend/
│   ├── core/               # Settings, URLs
│   ├── auth_app/           # Registrierung & Login
│   ├── players/            # Spielerverwaltung & Attribute
│   ├── formations/         # Formationen & Positionen (readonly)
│   ├── lineups/            # Aufstellungen & Bank
│   ├── matchreport/        # Spielberichte & Events
│   ├── training/           # Trainingshub & Blöcke
│   ├── clubs/              # Vereinsverwaltung & Einladungsfunktion
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── api/            # Axios-Requests & Auto-Refresh bei 401
        ├── components/     # Wiederverwendbare UI-Komponenten
        ├── pages/          # Seitenkomponenten
        ├── hooks/          # Custom Hooks (z.B. useAutoDismiss)
        └── utils/          # Hilfsfunktionen
```

---

## Installation & Start

### Voraussetzungen
- Python 3.12+
- Node.js v22+

### Backend starten

```bash
cd backend
python -m venv venv

# Linux/Mac
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend läuft unter: `http://localhost:8000/api/`

### Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft unter: `http://localhost:5173`

---

## API-Endpunkte

| Endpunkt | Methoden | Beschreibung |
|---|---|---|
| `/api/auth/register/` | POST | Registrierung |
| `/api/auth/login/` | POST | Login |
| `/api/auth/logout/` | POST | Logout |
| `/api/players/` | GET, POST, PATCH, DELETE | Spielerverwaltung |
| `/api/formations/` | GET | Formationen (readonly) |
| `/api/lineups/` | GET, POST, PATCH | Aufstellungen |
| `/api/matchreports/` | GET, POST, PATCH | Spielberichte |
| `/api/matchevents/` | GET, POST, DELETE | Spielereignisse |
| `/api/clubs/` | GET, POST | Vereinsdaten |
| `/api/training/` | GET, POST, PATCH, DELETE | Trainingseinheiten |

---

## Datenmodelle

### Player
Spieler mit Name, Rückennummer, Positionen und 12 Attributen in 3 Kategorien (Technisch / Mental / Physisch). Torwart-spezifische Overrides (Abschlag, Reflexe).

### Formation / FormationPosition
Formation (z.B. 4-3-3) mit einzelnen Positionen inkl. x/y-Koordinaten für das Spielfeld.

### Lineup / LineupSlot / LineupSubstitute
Konkrete Aufstellung für ein Spiel mit Startelf-Positionen und Ersatzspielern auf der Bank.

### MatchReport / MatchEvent
Spielbericht mit automatisch berechnetem Ergebnis aus Events (Tore, Karten, Wechsel). Events werden laufend gespeichert.

### Training / TrainingsBlock
Trainingseinheit mit automatisch generierten klassischen Blöcken bei Erstellung.

### Club
Vereinsdaten mit Einladungsfunktion (Einladungslink für Spieler/Trainer).

---

## Roadmap

### Phase 1 – Demo-Ready (Ziel: 10. Juli 2026)
- [x] Authentifizierung & Onboarding
- [x] Kader & Attribute
- [x] Vorbereitung & Aufstellung
- [x] Matchday mit Timer & Wechsel-Briefing
- [x] Post-Match Bericht
- [x] Trainingshub

### Phase 2 – Hinrunde (bis Winterpause)
- [ ] Übungsdatenbank im Trainingshub
- [ ] Taktikhub (animiertes Taktikboard, Laufwege, SVG-Zeichenfläche)
- [ ] Docker + PostgreSQL Migration

### Phase 3 – Rückrunde
- [ ] Spieler-/Trainer-Accounts mit Rollensystem
- [ ] LLM-basierte Spielanalyse (Textzusammenfassungen aus Spieldaten)
- [ ] MatchEvent player-Feld (Tor/Karte einem Spieler zuordnen)

### Langfristig
- [ ] Multi-Tenant-Architektur (mehrere Vereine/Teams)
- [ ] Vereinslizenz-Modell (~125–150€/Jahr)
- [ ] App Store Distribution via Capacitor

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Datenbank | SQLite (aktuell) → PostgreSQL (geplant) |
| Auth | JWT via httpOnly-Cookies, Auto-Refresh bei 401 |
| Frontend | React, Vite, JSX, CSS |
| Export | html2canvas (Aufstellungs-PNG) |
| Deployment | Render (aktuell), Docker geplant |

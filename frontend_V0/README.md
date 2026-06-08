# Matchday App Frontend

React/Vite Frontend für die Matchday Coaching App.

## Start

```powershell
npm install
npm run dev
```

Danach öffnen:

```txt
http://localhost:5173/
```

## Backend-Voraussetzung

Das Backend muss parallel laufen:

```powershell
python manage.py runserver
```

Erwartete API:

```txt
GET /api/players/
GET /api/formations/
GET /api/lineups/
```

## Hinweis

Dieses Frontend verhindert bereits im Frontend doppelte Feldzuordnungen. Das Backend sollte später zusätzlich validieren, dass ein Spieler nicht doppelt auf Feld oder Bank gesetzt werden kann.

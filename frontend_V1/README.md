# Matchday App Frontend

React/Vite-Frontend für die Matchday Coaching App.

## Start

```bash
npm install
npm run dev
```

Danach öffnen:

```txt
http://localhost:5173/
```

## Wichtig

Das Frontend wird nicht per Live Server gestartet. Es braucht den Vite-Dev-Server.

## Erwartete Backend-Endpunkte

```txt
GET    /api/players/
GET    /api/formations/
GET    /api/lineups/
POST   /api/lineups/
PATCH  /api/lineups/{id}/
DELETE /api/lineups/{id}/
```

POST/PATCH für Lineups müssen verschachtelte `slots` und `substitutes` akzeptieren, wenn Speichern/Aktualisieren vollständig funktionieren soll.

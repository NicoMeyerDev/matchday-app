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

## UX-Änderung Testrunde

- Titel- und Gegnerfelder wurden aus der Oberfläche entfernt.
- Der Button „Neu speichern“ heißt jetzt „Speichern“.
- Aktualisieren und Löschen liegen im Zahnrad-Menü bei „Gespeicherte Aufstellung“.
- Die Aufstellungsleiste ist einklappbar.
- Bank und Anweisung bleiben rechts als Seitenbereich sichtbar, damit sie im Spielbetrieb schnell erreichbar bleiben.


## Testlauf 3 UI-Anpassungen

- Aufstellungsleiste ist kompakt einklappbar und bleibt mit „Aufstellung“ beschriftet.
- Bank und Anweisung klappen rechts seitlich nach links auf.
- Eingeklappte Bank/Anweisung bleiben als schmale beschriftete Reiter sichtbar.
- Hinweis unter dem Spielfeld wurde entfernt.

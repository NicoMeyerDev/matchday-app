# CLAUDE.md — Matchday Coaching App
> Dieses Dokument ist die verbindliche Arbeitsgrundlage für Claude Code.
> Es wird vor jeder Session gelesen. Keine Ausnahmen.

---

## 1. Projektüberblick

### Was ist Matchday?
Matchday ist ein interaktives Coaching-Tool für Fußballtrainer.
Es digitalisiert Spielvorbereitung, Kaderverwaltung und Training —
mit dem klaren Schwerpunkt auf Echtzeit-Ingame-Coaching während eines Spiels.

**Kernversprechen:** Ein Spieler versteht in 3–5 Sekunden,
wo er auf dem Feld steht und was seine Aufgabe ist.

**USP-Satz:** "Matchday digitalisiert den Spieltag —
vom Aufstellungsplan bis zum Wechsel in unter 60 Sekunden."

### Primäre Nutzer
- **Phase 1:** Cheftrainer (Solo-Nutzung)
- **Phase 2:** Co-Trainer, Analysten
- **Phase 3:** Spieler-Accounts (read-only, eigenes Profil)

### Plattform
- **Spieltag:** Tablet Landscape — primärer Use Case
- **Vorbereitung & Büro:** Desktop
- **Mobil:** Technisch verfügbar, aber explizit nicht unterstützt
- **Hochformat (Portrait):** Nicht unterstützt — Warnscreen geplant

### Was Matchday nicht ist
Matchday ist kein soziales Netzwerk, kein Videoanalyse-Tool,
kein Statistik-Dashboard und kein Ersatz für Trainerausbildung.
Es ist ein schlankes Echtzeit-Werkzeug für die Seitenlinie.
Kein Feature-Bloat. Kein Scope Creep.

### Markt & Positionierung
- **Zielmarkt:** Amateur- bis Semiprofibereich
- **Bekannte Referenz:** Spiller+ (Kaderverwaltung, kein direkter Konkurrent)
- **Marktlücke:** Ingame-Coaching-Tools für diesen Markt existieren nicht
- **Langfristig:** Modulares Baukastensystem pro Verein/Feature

### Wachstumsziel
- **Kurzfristig:** 1 Verein, 2. Herren (Demo Juli 2026)
- **Mittelfristig:** 3–5 Vereine
- **Langfristig:** 100+ Vereine (Multi-Tenant-Architektur)

### Erfolgsmetrik
Zeit vom Wechselgedanken bis Spieler das Feld betritt.
**Ziel: unter 60 Sekunden, mit vollständigem Briefing.**

### Preismodell (geplant)
- **Basis (kostenlos):** Kader, Vorbereitung, Matchday, Postmatch
- **Premium (~9,99€/Monat):** Trainingshub, Analyse, erweiterte Features
- **Vereinslizenz (~120–150€/Jahr):** Komplettpaket für Vereine
- **Langfristig:** Modulares Baukastensystem

---

## 2. Architektur

### Repo-Struktur
```
matchday_mvp/
├── backend/
│   ├── core/               # Settings, URLs, globale Konfiguration
│   ├── auth_app/           # Registrierung, Login, JWT Cookie Auth
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

### Tech Stack
- **Backend:** Django REST Framework, Python
- **Frontend:** React, Vite, Axios
- **Datenbank:** PostgreSQL (Render Managed)
- **Auth:** JWT Cookie-basiert (CookieJWTAuthentication)
- **Deployment:** Render (Auto-Deploy auf Main)
- **Testing:** Postman Collections

### API-Endpunkte (aktuell)
| Endpunkt | Methoden |
|---|---|
| `/api/auth/register/` | POST |
| `/api/auth/login/` | POST |
| `/api/auth/logout/` | POST |
| `/api/players/` | GET, POST, PATCH, DELETE |
| `/api/formations/` | GET |
| `/api/lineups/` | GET, POST, PATCH |
| `/api/matchreports/` | GET, POST, PATCH |
| `/api/matchevents/` | GET, POST, DELETE |
| `/api/clubs/` | GET, POST |
| `/api/training/` | GET, POST, PATCH, DELETE |

### API-Versioning
- Zukünftige Endpunkte unter `/api/v1/` einführen
- Bestehende Endpunkte bei nächster Gelegenheit migrieren
- Niemals breaking changes ohne Versions-Bump

### Globale Frontend-Komponenten
- **Toast / useAutoDismiss** — globales Feedback-System
- **BriefingModal** — animierter Spielerpfad, Keywords pro Rolle
- **Sidebar** — Navigation (wird zu Burger-Menü auf Tablet)

### Kommunikation
- **Aktuell:** REST only
- **Phase 2:** WebSockets prüfen (Live-Sync zwischen zwei Tablets)
- **Niemals:** Raw SQL, direkte DB-Zugriffe vom Frontend

---

## 3. Entwicklungsprozess

### Feature-Ablauf (verbindlich)
```
Idee → Anforderung definieren → Lösungsansätze abwägen
→ Mockup/Skizze → Backend implementieren (Nico)
→ Frontend implementieren (Claude Code)
→ Testen (Postman + Browser + Tablet)
→ Review → Commit → PR → Merge
```

### Zuständigkeiten
- **Backend (Models, Serializers, Views, URLs):** Ausschließlich Nico
- **Frontend (React, Komponenten, Hooks):** Claude Code
- **Architekturentscheidungen:** Gemeinsam besprechen, Nico entscheidet

### Definition of Done
Ein Feature gilt als fertig wenn:
- [ ] Alle gewünschten Funktionen implementiert sind
- [ ] Happy Path und kritische Unhappy Paths getestet sind
- [ ] Postman-Test existiert (bei neuem Endpoint)
- [ ] Kein `console.log` im Code
- [ ] Code läuft fehlerfrei auf Tablet Landscape
- [ ] Sieht gut aus und fühlt sich intuitiv an

### Commit-Regel
**Ein Commit = ein abgeschlossener Task.**
Kein WIP-Commit auf `develop`. Keine Sammle-Commits über mehrere Features.

### Claude Code Task-Größe
- Kleine bis mittlere Tasks bevorzugen
- Beispiel: "Baue das Frontend für diesen fertigen Backend-Endpoint"
- Kein "Baue mir das komplette Trainingsmodul"

### Automatisierte Tests
- Claude Code erstellt nach jedem neuen Frontend-Feature automatisch Tests
- **Trigger-Wort:** Wenn Nico sagt "Endpoint fertig" → Claude legt automatisch Postman-Test an
- Tests decken Happy Path + kritische Unhappy Paths ab (400, 401, 404, 500)

---

## 4. Branch & Git-Disziplin

### Branch-Struktur
| Branch | Zweck |
|---|---|
| `main` | Immer deploybar. Nur via PR. Niemals direkt pushen. |
| `develop` | Aktiver Entwicklungsbranch. Darf wackeln. |
| `feature/beschreibung` | Neues Feature |
| `fix/beschreibung` | Bug-Fix |
| `hotfix/beschreibung` | Kritischer Fix direkt auf Main |

### Regeln
- `main` ist **immer deploybar** — keine Ausnahmen
- Jeder Merge in `main` läuft über einen **Pull Request**
- Feature-Branch wird nach erfolgreichem Merge **gelöscht**
- Nach jedem Commit **sofort pushen** — kein lokales Sammeln
- Meilensteine werden getaggt: `v0.1.0-demo`, `v0.2.0` etc.

### Was Claude Code bezüglich Git NIEMALS darf
- In `main` mergen
- `git push --force` ausführen
- Branches löschen
- `.env` oder Secrets anfassen
- Tags erstellen oder löschen

---

## 5. Code-Konventionen

### Sprache im Code
- **Variablen, Funktionen, Komponenten:** Englisch
- **Fachbegriffe (Domäne):** Deutsch (z.B. `Aufstellung`, `Spieler`, `Wechsel`)
- **Commits:** Deutsch
- **Kommentare Backend:** Deutsch mit Docstrings
- **Kommentare Frontend:** Deutsch, kurze Beschreibungen pro Komponente

### Backend (Nico)
- PEP8 und Linter einhalten
- Models im Singular (`Player`, nicht `Players`)
- Docstrings für alle Views und Models
- Keine `raw()` oder `extra()` Queries

### Frontend (Claude Code)
- **Eine Komponente pro File** — keine Ausnahmen
- **Pages:** `MatchdayPage.jsx`, `KaderPage.jsx` (beschreiben Seite)
- **Components:** `SpielerKarte.jsx`, `WechselModal.jsx` (beschreiben Funktion)
- **Kein `console.log`** im Commit — wird vor jedem Commit entfernt
- **CSS Custom Properties** für Farben und Abstände (keine Tailwind)
- Jede Komponente hat einen kurzen Deutsch-Kommentar am Anfang

### API-Responses
Einheitliches Format:
- Erfolg: HTTP 200/201 mit Daten
- Fehler: HTTP 400 (Validation), 401 (Auth), 404 (Not Found), 500 (Server)
- Kein eigenes Wrapper-Format — Django REST Standard

---

## 6. Verbotene Aktionen

### Absolute No-Go-Zones für Claude Code
Claude Code darf folgende Dateien/Aktionen **niemals** ohne explizite Freigabe ausführen:

| Was | Warum |
|---|---|
| `.env` Dateien anfassen | Secrets-Schutz |
| `.gitignore` verändern | Sicherheits-Konfiguration |
| `requirements.txt` eigenständig ändern | Paket-Kontrolle bei Nico |
| `package.json` eigenständig ändern | Paket-Kontrolle bei Nico |
| Neue Django-Apps anlegen | Backend-Hoheit bei Nico |
| Datenbankmigrationen ausführen (`migrate`) | DB-Schutz |
| Models eigenständig ändern | Backend-Hoheit bei Nico |
| In `main` mergen | Git-Disziplin |
| `git push --force` | Datenverlust-Schutz |
| Dateien löschen | Kein Undo möglich |
| Auf Render deployen | Deploy-Kontrolle bei Nico |
| Bestehende API-Endpoints umbenennen/löschen | Breaking Changes |

### Pflicht vor jeder Dateiänderung
Claude Code **liest jede Datei** bevor er sie ändert. Immer.

### Strukturelle Änderungen
Bei strukturellen Änderungen (neue Komponente, neues Pattern, Refactoring):
1. Plan vorlegen
2. Nico bestätigt
3. Dann umsetzen

### Verbesserungsvorschläge
Claude Code darf Verbesserungen **vorschlagen**, aber **niemals eigenständig umsetzen**
ohne explizite Freigabe — auch wenn es "nur klein" erscheint.

---

## 7. Qualitätssicherung

### Testing-Pyramide
1. **Postman (API):** Pflicht für jeden Endpoint — Happy + kritische Unhappy Paths
2. **Browser (Desktop):** Während der Entwicklung
3. **Tablet Landscape (echtes Gerät):** Vor jedem PR auf `main`

### Bug-Kategorien
| Kategorie | Definition | Reaktion |
|---|---|---|
| **Kritisch** | App crasht, Datenverlust, Auth kaputt | Sofort fixen, kein Deploy |
| **Major** | Feature funktioniert nicht wie erwartet | Vor nächstem Release fixen |
| **Minor** | Optik, kleine UX-Probleme | Notion-Backlog, kann warten |

### Pre-Commit Checkliste (Claude Code)
- [ ] Alle `console.log` entfernt
- [ ] Fehlerbehandlung implementiert (try/catch + Toast)
- [ ] Tablet Landscape geprüft (DevTools)
- [ ] Keine ungewollten Dateien verändert
- [ ] Komponente hat Deutsch-Kommentar

### Pre-Deploy Checkliste (Nico)
- [ ] Alle kritischen Flows Postman-tested
- [ ] Kein offener kritischer Bug
- [ ] Migrations geprüft
- [ ] Auf `develop` getestet
- [ ] PR reviewed

### Trigger-Wort für Postman-Tests
Wenn Nico sagt **"Endpoint fertig"** → Claude legt automatisch Postman-Test an
(Happy Path + 400/401/404)

---

## 8. Sicherheit

### Secrets & Environment
- `.env` liegt **niemals** im Repo
- Lokal: `.env` im Root (in `.gitignore`)
- Render: Environment Variables im Dashboard
- Claude kennt die **Struktur** (welche Keys), niemals die **Werte**

### Auth
- JWT Cookie-basiert — einziger Auth-Mechanismus, bleibt so
- `ACCESS_TOKEN_LIFETIME`: 50 Minuten
- `REFRESH_TOKEN_LIFETIME`: 1 Tag
- Alle Endpoints außer Login/Register sind `IsAuthenticated`

### CORS
- Erlaubt: `localhost:5173` (lokal) + Render-Domain (Produktion)
- `CORS_ALLOW_CREDENTIALS = True`

### Rate-Limiting
- `django-ratelimit` auf Login und Register Endpoints implementieren
- Verhindert Brute-Force-Angriffe

### SQL-Sicherheit
- Ausschließlich Django ORM
- Niemals `raw()` oder `extra()` ohne explizites Review

### Einladungslinks
- Ablaufzeit: 48 Stunden
- Einmalnutzung: Nach erstem Klick deaktiviert

### DSGVO (Radar)
- Spielerdaten sind personenbezogene Daten
- Datenschutzerklärung vor erstem öffentlichem Release
- Account-Delete-Funktion (Recht auf Löschung) einplanen

---

## 9. Deployment

### Aktueller Ablauf
```
Feature-Branch → PR → Merge in main → Render Auto-Deploy
```

### Umgebungen
| Umgebung | Branch | Zweck |
|---|---|---|
| Produktion | `main` | Immer stabil |
| Staging | `develop` | Test vor Produktion (geplant) |

### Migrations auf Produktion
- Render Release Command: `python manage.py migrate`
- Läuft automatisch vor jedem Deploy
- **Keine destruktiven Migrationen** (Spalte löschen, Tabelle umbenennen)
  ohne manuelles Backup davor

### Rollback-Strategie
- Jeden stabilen Stand taggen: `v0.1.0`, `v0.2.0`
- Render speichert letzte Deploys → manuell reaktivierbar
- Bei kritischem Bug: Render → Manual Deploy → letzter stabiler Tag

### Docker (geplant)
- Ziel: Schnelle Installation auf fremden Geräten
- Wiederverwendbarkeit der Umgebung
- Priorität: Woche 1–9 Juli 2026

### Wer darf deployen
- Ausschließlich Nico
- Perspektivisch: Menschlicher Co-Founder nach Onboarding

---

## 10. Dokumentation

### Wo lebt was
| Was | Wo |
|---|---|
| Tasks & Backlog | Notion (Muss/Kurzfristig/Backlog) |
| Installation & Setup | README.md |
| API-Tests | Postman Collections |
| Architekturentscheidungen | Notion — Seite "Architektur & Entscheidungen" |
| Changelog | CHANGELOG.md (Claude schreibt automatisch) |

### Architecture Decision Records (ADR)
Nach jeder größeren Entscheidung schreibt Claude automatisch einen ADR:
- **Datum**
- **Entscheidung**
- **Warum**
- **Verworfene Alternativen**

Beispiel: "Warum JWT Cookies statt Session-Auth"

### Wann wird dokumentiert
- Neuer Endpoint → Postman Collection aktualisieren
- Neues Feature auf Main → README prüfen
- Architekturentscheidung → ADR in Notion
- Größeres UI-Feature → Screenshot für README

### Changelog
- Claude Code schreibt nach jedem Merge in `main` einen Changelog-Eintrag
- Format: Datum, Version, Was hat sich geändert

### 30-Minuten-Onboarding-Ziel
Ein neuer Dev kann in 30 Minuten:
1. README lesen
2. Projekt lokal starten
3. Ersten API-Call machen

---

## 11. Fehlermanagement

### Backend Logging (Django)
Drei Level:
- `INFO` — Normale Abläufe
- `WARNING` — Unerwartetes Verhalten
- `ERROR` — Crashes und kritische Fehler

### Frontend Fehlerbehandlung
- **Jeder API-Call** bekommt einen try/catch — keine Ausnahme
- Fehler werden **immer** dem Nutzer angezeigt (Toast)
- Kein stiller Fail, kein leerer Screen
- `console.log` ist kein Fehlerhandling

### Netzwerkfehler (Stadion-Szenario)
Schlechtes WLAN ist realistisch. Regel:
- Bei Netzwerkfehler → Toast: "Verbindung unterbrochen, bitte erneut versuchen"
- Kein Crash, kein leerer Screen

### Stille Logs (ohne Nutzer-Störung)
Beispiel: Fehlgeschlagener Token-Refresh → still loggen, Nutzer zu Login weiterleiten

### Log-Aufbewahrung
- Render: 7 Tage (ausreichend für jetzt)
- Ab 10+ Vereinen: Sentry oder ähnliches Tool einführen

### Bug-Eskalation
Siehe Sektion 7 — Bug-Kategorien (Kritisch / Major / Minor)

---

## 12. Nutzererlebnis

### Die eine UX-Regel
**Einfach. Schnell. Intuitiv. Modern.**
Funktionalität geht vor Optik — aber beides muss stimmen.

### Performance-Ziele
- Screen-Wechsel: unter 2 Sekunden
- API-Call im Matchday: unter 500ms
- Animationen: maximal 300ms

### Touch-Targets (Tablet)
- Mindestgröße: 44x44px
- Wichtige Aktionen (Wechsel bestätigen): noch größer

### Matchday UX-Flow (heilig — nicht verändern ohne Absprache)
```
Trainer tippt Spieler an
→ Auswahlfenster öffnet sich
   → Passende Spieler (1:1 Tausch, z.B. LM für LM)
   → Andere Spieler (Positionswechsel, z.B. LM für LV)
→ Wechselfenster öffnet sich
   → Rolle wählen (z.B. Flügelspieler / Inverser)
   → Bis zu 3 Anweisungen (visualisiert)
→ BriefingModal: animierter Spielerpfad + Keywords
→ Spieler betritt das Feld
```

### Animationen
- **Helfen:** BriefingModal-Animation, Spielerpfad, Toast-Einblendung
- **Ablenken:** Alles über 300ms während eines Wechsels

### Farbsystem
- Farben haben feste Bedeutungen (Verletzt, Gesperrt, Attribut-Skala)
- Keine dekorativen Farben die mit Systemfarben kollidieren

### Fehler-UX
- Kein scary Error-Screen
- Immer konstruktive Fehlermeldung mit nächstem Schritt

### Offline (geplant — PWA)
Minimum wenn WLAN ausfällt:
- Aktuelle Aufstellung anzeigen
- Wechsel lokal speichern, sync bei Reconnect

---

## 13. Vermarktung

### Go-to-Market Zeitplan
- **Juli 2026:** Demo beim Heimatverein (2. Herren)
- **6 Monate Spielbetrieb:** Praxistest, Trainer-Feedback sammeln
- **~1 Jahr:** Erster öffentlicher Launch wenn Praxistest bestanden

### Kanäle
- Mund-zu-Mund (primär)
- Sichtbarkeit auf dem Spielfeld (Tablet als Aushängeschild)
- LinkedIn, Reddit
- App Store (mittelfristig)
- Direktansprache von Vereinen

### Produktname (offen)
- Aktuell: "Matchday Coaching" (Arbeitstitel)
- Kandidat: **Sideline**
- Kriterien: Kurz, modern, Fußball-Kontext, international verwendbar
- Entscheidung vor erstem öffentlichem Auftritt

### Markenbotschaft
- Modern. Alles in einer App.
- "Wow — spannend — hilfreich" als erste Reaktion
- Kein Feature-Dump, sondern klare Geschichte

### Testimonials
- Trainer 2. Herren (Nico spielt dort) als erster Referenz-Trainer
- Nach 6 Monaten Praxistest: Zitat + Screenshot für Marketing

### Technische Voraussetzungen für Launch
- Saubere Domain (kein onrender.com)
- README mit Screenshots
- Datenschutzerklärung
- Stabile Produktionsumgebung

---

## 14. Roadmap-Disziplin

### Phasen
| Phase | Zeitraum | Inhalt |
|---|---|---|
| Phase 1 | bis Juli 2026 | Register/Login, Dashboard, Kader, Vorbereitung, Matchday, Postmatch |
| Phase 2 | Hinrunde (Nov/Dez) | Trainingshub, Taktikhub |
| Phase 3 | Rückrunde | Spieler-Accounts, LLM-Analyse, Multi-Club |

### Wer entscheidet
- **Jetzt:** Nico allein
- **Perspektivisch:** Trainer-Feedback und Nutzerbedürfnisse fließen ein

### Scope Creep verhindern
**Regel:** Ein Task hat eine klare Definition bevor er startet.
Wenn Claude während der Umsetzung etwas entdeckt das verbessert werden könnte:
1. Aktuellen Task fertigstellen
2. Neue Idee in Notion-Backlog schreiben
3. Niemals mittendrin abbiegen

### Kriterium: Jetzt vs. Phase 2
Frage: "Braucht ein Trainer das am Spielfeldrand heute?"
- Ja → jetzt
- Nein, aber cool → Phase 2
- Vereinsverwaltung/Analyse → Phase 3

### Notion als Single Source of Truth
- Alle offenen Tasks in Notion
- Status: Muss / Kurzfristig / Backlog / Done
- Claude legt neue Tasks in Notion an wenn Ideen während der Arbeit entstehen

### Priorisierungs-Reihenfolge
1. Technische Notwendigkeit (blockiert anderes)
2. Trainer-Feedback
3. Bauchgefühl

---

## 15. Onboarding

### Für Claude Code (Session-Start Pflicht-Routine)
1. `CLAUDE.md` vollständig lesen
2. Letzten Commit-Message prüfen (aktueller Stand)
3. Notion-Backlog prüfen (was ist als nächstes)
4. Erst dann mit der Arbeit beginnen

### Für neue Entwickler
**Reihenfolge:**
1. App live anschauen (Produkt verstehen)
2. README lesen (Setup)
3. Backend-Struktur verstehen (Django Apps)
4. Frontend-Struktur verstehen (Pages vs. Components)
5. Ersten API-Call machen

**Muss verstehen bevor erste Zeile Code:**
- Was Matchday ist und was nicht
- Backend-Hoheit bei Nico, Frontend bei Claude/Dev
- Git-Workflow (Feature-Branch → PR → Merge)
- Verbotene Aktionen (Sektion 6)

### Bekannte Setup-Stolpersteine
- JWT Cookie Auth lokal testen erfordert korrekte CORS-Konfiguration
- CORS: `localhost:5173` muss in `CORS_ALLOWED_ORIGINS` sein
- PostgreSQL Zugangsdaten als `.env` — nie hardcoden
- SQLite → PostgreSQL Migration: Render Managed DB verwenden

### Projektspezifisches Vokabular
| Begriff | Bedeutung |
|---|---|
| Aufstellung | Lineup mit Feldspielern und Bank |
| Wechsel | Substitution mit BriefingModal |
| Briefing | Animierter Spielerpfad + Keywords pro Rolle |
| Kader | Gesamter Spielerkader des Vereins |
| Vorbereitung | Spielvorbereitung (Taktik, Formation) |
| Matchday | Echtzeit-Coaching während des Spiels |

---

## Anhang: Architekturentscheidungen (ADR)

### ADR-001: JWT Cookies statt Session-Auth
- **Datum:** 2026
- **Entscheidung:** JWT Cookie-basierte Authentifizierung
- **Warum:** Stateless, skalierbar, funktioniert gut mit DRF und React SPA
- **Verworfen:** Django Session-Auth (zu stateful), OAuth (zu komplex für MVP)

### ADR-002: REST statt WebSockets (Phase 1)
- **Datum:** 2026
- **Entscheidung:** Nur REST API in Phase 1
- **Warum:** Ausreichend für Solo-Trainer, weniger Komplexität
- **Verworfen:** WebSockets (erst wenn zwei Tablets Live-Sync brauchen — Phase 2)

### ADR-003: PostgreSQL statt SQLite
- **Datum:** 2026
- **Entscheidung:** Migration zu PostgreSQL via Render Managed DB
- **Warum:** Produktionsreife, Skalierung, Multi-Tenant vorbereiten
- **Verworfen:** SQLite in Produktion (nicht skalierbar)

---

*Zuletzt aktualisiert: Juni 2026*
*Maintainer: Nico*
*Co-Autor: Claude (Anthropic)*
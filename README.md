# SV Wacker Burghausen eSports — Team-Hub

Digitales Team- und Match-Management-System für SV Wacker Burghausen eSports: Kaderverwaltung,
Spielplan, Zu-/Absagen, Aufstellungs-Editor, Taktik, Ergebnisse und Benachrichtigungen — mit
sauberem Rollen-/Rechtesystem für **Spieler**, **Captain** und **Manager/Admin**.

Gebaut mit **Next.js 14 (App Router) + TypeScript + Prisma + NextAuth + Tailwind CSS**.

---

## Inhalt

1. [Funktionsüberblick](#funktionsüberblick)
2. [Tech-Stack](#tech-stack)
3. [Schnellstart (lokal)](#schnellstart-lokal)
4. [Erster Zugang & Demo-Daten](#erster-zugang--demo-daten)
5. [Rollen & Rechte](#rollen--rechte)
6. [Projektstruktur](#projektstruktur)
7. [Umgebungsvariablen](#umgebungsvariablen)
8. [Datenbank & Migrationen](#datenbank--migrationen)
9. [Deployment](#deployment)
   - [Variante A: Vercel + Neon/Supabase (empfohlen)](#variante-a-vercel--neonsupabase-postgresql-empfohlen)
   - [Variante B: Docker / eigener Server](#variante-b-docker--eigener-server)
10. [Discord-Integration](#discord-integration)
11. [Sicherheit & Passwörter ändern](#sicherheit--passwörter-ändern)
12. [Bekannte Grenzen & mögliche Erweiterungen](#bekannte-grenzen--mögliche-erweiterungen)

---

## Funktionsüberblick

- **Dashboard** — nächstes Spiel inkl. eigener Zu-/Absage, Kaderstatus, kommende Spieltage, letzte Ergebnisse
- **Kader** — Spielerprofile (Gamertag, echter Name optional, Position, Teamrolle, Status), Karten- & Tabellenansicht
- **Spielplan** — alle Spiele mit Gegner, Termin, Wettbewerb, Heim/Auswärts, Status, Ergebnis
- **Spieltag-Verwaltung** — Detailseite je Spieltag: Zu-/Absagen, Aufstellung, Taktik, Notizen, Ergebnis
- **Zu-/Absagen** — Spieler sagen pro Spiel zu/ab (mit optionalem Grund), Captain/Manager sehen die Übersicht
- **Aufstellungs-Editor** — grafische Darstellung auf dem Spielfeld, 11 gängige Formationen (4-3-3, 4-4-2,
  4-4-2 Raute, 4-2-3-1, 4-1-4-1, 4-1-2-1-2, 4-3-1-2, 3-5-2, 3-4-3, 5-3-2, 5-4-1), Klick-Auswahl für
  Positionen & Ersatzbank, Entwurf speichern, veröffentlichen
- **Taktik** — Formation, Spielweise, Pressing, Tempo, freies Textfeld für taktische Anweisungen
- **Ergebnisse** — Saisonbilanz (Siege/Unentschieden/Niederlagen, Tore) und Spielverläufe
- **Benachrichtigungen** — In-App-Center inkl. Badge-Zähler für neue Spieltage, Nominierungen, veröffentlichte
  Aufstellungen, Taktik-Updates, Absagen, Ergebnisse
- **Captain-Bereich** — kompakte Übersicht aller offenen Spieltage mit Zu-/Absage-Status und Schnellzugriff auf
  Aufstellung & Taktik
- **Admin/Manager-Bereich** — Kaderverwaltung (anlegen/bearbeiten/entfernen, Rollen vergeben), Spieltag-Verwaltung
  (Gegner, Termin, Liga, Ergebnis), Benutzerverwaltung (Rollen, Aktivierung, Passwort-Reset)
- **Zusätzlich ergänzt** (sinnvolle Praxis-Features, die in der Aufgabenstellung nicht explizit gefordert, aber für
  ein echtes Team hilfreich sind):
  - Wöchentliche Standard-Verfügbarkeit je Spieler (unabhängig von einzelnen Spielen)
  - Spieler-Saisonstatistik (Einsätze, Startelf/Einwechslungen, Siege/Niederlagen) auf dem Profil
  - Eigenständige Passwort-Änderung im Profil
  - Admin-Funktion „Passwort zurücksetzen" für einzelne Benutzer
  - Kartenansicht **und** Tabellenansicht im Kader (umschaltbar), inkl. Suche/Filter
  - Spielstatus-Automatik: „Geplant" → „Aufstellung offen" (sobald ein Entwurf existiert) → „Aufstellung
    veröffentlicht" → „Gespielt"

## Tech-Stack

| Bereich          | Technologie                                             |
| ---------------- | -------------------------------------------------------- |
| Frontend/Backend | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript |
| Styling          | Tailwind CSS (eigenes Dark-Mode Design-System)            |
| Datenbank/ORM    | [Prisma](https://www.prisma.io/) — standardmäßig SQLite (lokal, kein Setup), produktiv PostgreSQL |
| Authentifizierung| [NextAuth.js](https://next-auth.js.org/) (Credentials Provider, JWT-Sessions) |
| Icons            | lucide-react                                              |
| Validierung      | zod                                                        |

Die App ist bewusst als **eigenständiges Next.js-Projekt** gebaut (kein Vendor-Lock-in zu Supabase o.ä.),
lässt sich aber genauso gut mit Supabase-Postgres als Datenbank betreiben — einfach die `DATABASE_URL`
auf die Supabase-Connection-String zeigen lassen (siehe [Deployment](#deployment)).

## Schnellstart (lokal)

Voraussetzung: [Node.js](https://nodejs.org/) ≥ 18.18 und npm.

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen anlegen
cp .env.example .env
# Öffne .env und setze NEXTAUTH_SECRET, z.B. mit:
openssl rand -base64 32

# 3. Datenbank anlegen (Standard: lokale SQLite-Datei, kein Server nötig)
npm run db:push

# 4. Ersten Zugang anlegen (siehe unten — Kader startet komplett leer)
npm run db:seed

# 5. Entwicklungsserver starten
npm run dev
```

Die App läuft danach unter **http://localhost:3000**.

Für einen Produktions-Build lokal:

```bash
npm run build
npm run start
```

## Erster Zugang & Demo-Daten

Die App startet **standardmäßig komplett leer** — kein Beispiel-Kader, keine Beispiel-Spiele. Es gibt
genau zwei Wege, sie zu befüllen:

### Normalbetrieb: `npm run db:seed`

Legt **ausschließlich einen einzigen Manager-Zugang** an, mit dem alles Weitere im Team-Hub selbst
gepflegt wird (Spieler, Captain-Rolle, Spieltage, …). E-Mail, Name und Passwort dieses ersten Zugangs
werden über `INITIAL_MANAGER_NAME`, `INITIAL_MANAGER_EMAIL` und `INITIAL_MANAGER_PASSWORD` in `.env`
gesetzt (siehe `.env.example`) — bitte **vor dem ersten `npm run db:seed`** eigene, echte Werte
eintragen. Ohne gesetzte Variablen wird ersatzweise `manager@wacker-esports.de` / `Manager2026!`
angelegt; das Passwort sollte dann sofort nach dem ersten Login unter **Profil → Passwort ändern**
geändert werden.

Ist bereits ein Benutzer mit dieser E-Mail vorhanden, tut der Befehl nichts (idempotent — gefahrlos
mehrfach ausführbar).

### Nur zum Ausprobieren: `npm run db:seed:demo`

Befüllt die Datenbank stattdessen mit einem kompletten **Test-Kader** (16 Spieler inkl. drei
Demo-Zugängen `manager@wacker-esports.de` / `Manager2026!`, `captain@wacker-esports.de` /
`Captain2026!`, `player@wacker-esports.de` / `Player2026!`, Passwörter der übrigen Testspieler jeweils
`Wacker2026!`), dazu Beispiel-Spieltage, Aufstellungen, Taktiken und Ergebnisse — praktisch, um alle
Funktionen sofort mit realistischen Daten zu sehen. **Für den echten Betrieb nicht verwenden** —
danach `npm run db:reset && npm run db:seed` ausführen, um wieder mit einem leeren, echten Kader zu
starten.

## Rollen & Rechte

Die Berechtigungen werden **serverseitig doppelt** geprüft — einmal in `src/middleware.ts` (blockiert den
Seitenaufruf komplett) und zusätzlich in jeder betroffenen API-Route (`src/app/api/**/route.ts`). Eine
reine Ausblendung von Buttons im Frontend reicht in dieser App nirgends aus, um eine Aktion auszulösen.

| Funktion                                   | Spieler | Captain | Manager |
| ------------------------------------------- | :-----: | :-----: | :-----: |
| Eigenes Profil ansehen/bearbeiten           |   ✅    |   ✅    |   ✅    |
| Kommende Spiele & Ergebnisse ansehen        |   ✅    |   ✅    |   ✅    |
| Zu-/Absage zu Spielen                       |   ✅    |   ✅    |   ✅    |
| Veröffentlichte Aufstellung & Taktik ansehen |   ✅    |   ✅    |   ✅    |
| Aufstellung festlegen/veröffentlichen       |   ❌    |   ✅    |   ✅    |
| Taktik festlegen                            |   ❌    |   ✅    |   ✅    |
| Zu-/Absagen aller Spieler einsehen          |   ❌    |   ✅    |   ✅    |
| Spieltag-Notizen bearbeiten                 |   ❌    |   ✅    |   ✅    |
| Spieler anlegen/bearbeiten/entfernen        |   ❌    |   ❌    |   ✅    |
| Rollen vergeben, Captain bestimmen          |   ❌    |   ❌    |   ✅    |
| Spieltage anlegen, Gegner/Termin/Liga       |   ❌    |   ❌    |   ✅    |
| Ergebnisse eintragen                        |   ❌    |   ❌    |   ✅    |
| Benutzerverwaltung (Rollen, Reset, Sperren) |   ❌    |   ❌    |   ✅    |

**Es gibt keine öffentliche Registrierung.** Es existiert keine „Konto erstellen"-Seite und keine
entsprechende API-Route — neue Zugänge entstehen ausschließlich, wenn ein **Manager** sie unter
**Admin/Manager → Kader → Spieler hinzufügen** anlegt (dort wird auch die Rolle — Spieler, Captain oder
Manager — festgelegt und ein Startpasswort generiert). Wer also den Link zur App weitergibt, verschafft
damit niemandem automatisch Zugriff — ohne ein von dir angelegtes Konto kommt man nur bis zur
Login-Seite.

## Projektstruktur

```
src/
  app/
    (auth)/login/           Login-Seite (öffentlich)
    (app)/                  Geschütztes Layout (Sidebar, Topbar, mobile Navigation)
      dashboard/            Startseite
      kader/                Kaderliste + Spielerprofil ([id])
      spielplan/             Spielplan-Liste + Spieltag-Detail ([id])
      spieltage/             Spieltag-Verwaltung (Captain/Manager-Fokus)
      aufstellung/[matchId]/ Aufstellungs-Editor / Ansicht
      taktik/[matchId]/      Taktik-Editor / Ansicht
      ergebnisse/            Saisonbilanz & Ergebnisse
      benachrichtigungen/    Notification-Center
      profil/                Eigenes Profil & Passwort ändern
      captain/               Captain-Bereich
      admin/                 Manager/Admin-Bereich (Kader, Spieltage, Benutzer)
    api/                     REST-artige API-Routen (Next.js Route Handlers)
  components/                Wiederverwendbare UI-Komponenten (Client & Server)
  lib/                       Prisma-Client, Auth-Konfiguration, Hilfsfunktionen, Konstanten
  middleware.ts              Rollenbasierte Zugriffskontrolle auf Seiten- & API-Ebene
prisma/
  schema.prisma              Datenbankschema
  seed.ts                    Produktions-Seed (nur 1 Manager-Zugang, Kader bleibt leer)
  seed-demo.ts                Demo-Seed (Testkader, Spiele, Aufstellungen — nur zum Ausprobieren)
```

## Umgebungsvariablen

Siehe `.env.example`. Wichtig:

- `DATABASE_URL` — Verbindung zur Datenbank (Standard: lokale SQLite-Datei `file:./dev.db`)
- `NEXTAUTH_SECRET` — geheimer Schlüssel für Session-Signierung (**vor Produktivbetrieb unbedingt neu
  generieren**, z.B. `openssl rand -base64 32`)
- `NEXTAUTH_URL` — die öffentliche URL der App (lokal `http://localhost:3000`, produktiv z.B.
  `https://team.wacker-esports.de`)

## Datenbank & Migrationen

Das Schema in `prisma/schema.prisma` ist bewusst so gehalten, dass es **unverändert** sowohl mit SQLite
(Standard, für lokale Entwicklung/Demo) als auch mit PostgreSQL (empfohlen für Produktion) funktioniert.
Alle Enum-artigen Felder (Rollen, Status, Formationen ...) sind als String modelliert und werden in
`src/lib/constants.ts` sowie in den API-Routen (per `zod`) validiert — SQLite unterstützt keine nativen
Enums, PostgreSQL schon, daher dieser bewusste Kompromiss für maximale Portabilität.

- `npm run db:push` — Schema direkt in die Datenbank übertragen (schnell, ohne Migrationshistorie,
  ideal für lokale Entwicklung/SQLite)
- `npm run db:migrate` — versionierte Migration erstellen (`prisma migrate dev`) — empfohlen, sobald
  auf PostgreSQL umgestellt wird
- `npm run db:seed` — legt den ersten Manager-Zugang an (Kader bleibt leer); gefahrlos mehrfach
  ausführbar, macht nichts, wenn der Zugang schon existiert
- `npm run db:seed:demo` — alternativ: kompletten Test-Kader inkl. Beispiel-Spielen laden (nur zum
  Ausprobieren, siehe [Erster Zugang & Demo-Daten](#erster-zugang--demo-daten))
- `npm run db:studio` — Prisma Studio öffnen (grafischer Datenbank-Browser)

## Deployment

Die App ist so gebaut, dass sie danach öffentlich über eine URL erreichbar ist. Zwei Wege sind
vorbereitet:

### Variante A: Vercel + Neon/Supabase PostgreSQL (empfohlen)

Das ist der unkomplizierteste Weg zu einer öffentlichen URL — beide Dienste haben kostenlose Stufen.

1. **Repository zu GitHub pushen** (dieses Projekt als neues Repo anlegen und pushen).
2. **PostgreSQL-Datenbank anlegen**: bei [Neon](https://neon.tech) oder [Supabase](https://supabase.com)
   ein kostenloses Projekt erstellen und die Connection-String (`DATABASE_URL`) kopieren.
3. In `prisma/schema.prisma` die Zeile

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   auf

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

   ändern und committen.
4. Lokal einmalig gegen die neue Produktionsdatenbank migrieren und den ersten Manager-Zugang anlegen
   (setze vorher `INITIAL_MANAGER_NAME`/`INITIAL_MANAGER_EMAIL`/`INITIAL_MANAGER_PASSWORD` in `.env`
   auf eure echten Werte):

   ```bash
   DATABASE_URL="postgresql://..." npm run db:migrate
   DATABASE_URL="postgresql://..." npm run db:seed
   ```

5. Auf [vercel.com](https://vercel.com) **„New Project"** → das GitHub-Repo auswählen (Next.js wird
   automatisch erkannt).
6. Unter **Environment Variables** setzen:
   - `DATABASE_URL` → die Postgres-Connection-String
   - `NEXTAUTH_SECRET` → per `openssl rand -base64 32` erzeugen
   - `NEXTAUTH_URL` → die endgültige Vercel-URL (z.B. `https://wacker-esports.vercel.app`)
7. **Deploy** klicken. Vercel führt automatisch `npm install` und `npm run build` aus — und `npm run
   build` ruft dabei bereits `prisma generate` auf (siehe `package.json`).
8. Fertig — die App ist unter der Vercel-URL öffentlich erreichbar.

Danach genügt jeder weitere `git push`, um ein neues Deployment auszulösen.

### Variante B: Docker / eigener Server

Für Selbst-Hosting (z.B. auf einem eigenen VPS, Railway, Fly.io o.ä.) liegt ein produktionsfertiges
Docker-Setup bei:

```bash
# 1. In prisma/schema.prisma provider auf "postgresql" umstellen (siehe oben)
# 2. NEXTAUTH_SECRET in docker-compose.yml durch einen echten Wert ersetzen
# 3. Stack starten (App + PostgreSQL-Datenbank)
docker compose up --build

# 4. Einmalig den ersten Manager-Zugang anlegen (Kader bleibt leer)
docker compose exec app npm run db:seed
```

Die App ist danach unter `http://localhost:3000` erreichbar (bzw. über den Reverse Proxy/die Domain,
die vor den Container geschaltet wird — z.B. Caddy/nginx mit TLS für die öffentliche URL).

Der Container führt beim Start automatisch `prisma migrate deploy` aus (`docker-entrypoint.sh`), wendet
also ausstehende Migrationen an, bevor der Server startet.

## Discord-Integration

Zu-/Absagen können optional zusätzlich über Discord laufen — komplett unabhängig vom Rest der App:
Ist nichts konfiguriert, blenden sich die Discord-Funktionen einfach aus und alles läuft normal weiter.
Es gibt zwei unabhängig voneinander nutzbare Stufen.

### 1) Nur Benachrichtigungen (Webhook, kein Bot nötig)

Postet automatisch eine Nachricht in einen Discord-Kanal, wenn ein neuer Spieltag erstellt, die
Aufstellung veröffentlicht, die Taktik aktualisiert oder ein Ergebnis eingetragen wird.

1. In Discord: Kanal-Einstellungen (Zahnrad) → **Integrationen** → **Webhooks** → **Neuer Webhook** →
   Namen vergeben, Ziel-Kanal wählen → **Webhook-URL kopieren**.
2. In `.env` eintragen:
   ```
   DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
   ```
3. App neu starten. Fertig — ab jetzt kommen Ankündigungen automatisch in Discord an.

### 2) Zu-/Absage direkt per Button in Discord (Bot, erfordert öffentliche URL)

Damit postet der Captain/Manager auf der Spieltag-Seite („Spieltag verwalten" → **In Discord
ankündigen") eine Nachricht mit **✅ Zusage** / **❌ Absage**-Buttons. Klickt ein Spieler dort, wird das
automatisch im Team-Hub gespeichert.

**Wichtig:** Discord ruft dafür eure „Interactions Endpoint URL" per HTTPS auf — das funktioniert nur,
wenn die App bereits **öffentlich unter einer echten HTTPS-Adresse** erreichbar ist (siehe
[Deployment](#deployment)). Auf `localhost` allein funktioniert dieser Teil nicht (außer man tunnelt z.B.
mit [ngrok](https://ngrok.com)).

1. Auf [discord.com/developers/applications](https://discord.com/developers/applications) → **New
   Application** → einen Namen vergeben (z.B. „Wacker eSports Team-Hub").
2. Unter **Bot** → **Reset Token** → Token kopieren → das ist `DISCORD_BOT_TOKEN`.
3. Unter **General Information**:
   - **Application ID** kopieren → `DISCORD_APPLICATION_ID`
   - **Public Key** kopieren → `DISCORD_PUBLIC_KEY`
4. Unter **OAuth2 → URL Generator**: Scopes `bot` anhaken, bei den Bot-Permissions **Send Messages**,
   **Embed Links** und **Read Message History** anhaken. Die generierte URL öffnen und den Bot auf euren
   Discord-Server einladen.
5. Im gewünschten Kanal: Rechtsklick auf den Kanal → **Kanal-ID kopieren** (Entwicklermodus muss dafür in
   Discord unter Einstellungen → Erweitert aktiviert sein) → `DISCORD_CHANNEL_ID`.
6. In `.env` bzw. in den Vercel-Umgebungsvariablen eintragen:
   ```
   DISCORD_BOT_TOKEN="..."
   DISCORD_APPLICATION_ID="..."
   DISCORD_PUBLIC_KEY="..."
   DISCORD_CHANNEL_ID="..."
   ```
7. App deployen/neu starten, damit die öffentliche URL bereitsteht.
8. Zurück im Developer Portal unter **General Information** → **Interactions Endpoint URL** eintragen:
   ```
   https://<eure-domain>/api/discord/interactions
   ```
   Discord schickt sofort einen Test-Ping; wird er nicht innerhalb weniger Sekunden mit `200 OK`
   beantwortet, lässt sich die URL nicht speichern — das ist normal beim allerersten Versuch, falls die
   App gerade erst gestartet ist; einfach nach ein paar Sekunden erneut speichern.
9. **Jeder Spieler** muss einmalig seine **Discord-User-ID** im Team-Hub hinterlegen, damit ein
   Button-Klick ihm zugeordnet werden kann: **Profil → Spielerprofil bearbeiten → Discord-User-ID**
   (Anleitung zum Kopieren der eigenen ID steht direkt im Formular).

Danach erscheint auf jeder Spieltag-Seite für Captain/Manager der Button **„In Discord ankündigen"**.

## Sicherheit & Passwörter ändern

- Alle Passwörter werden mit **bcrypt** gehasht gespeichert, niemals im Klartext.
- **Jeder Benutzer** kann sein eigenes Passwort unter **Profil → Passwort ändern** selbst ändern.
- **Manager** können für jeden Benutzer über **Admin/Manager → Benutzerverwaltung** ein neues Passwort
  setzen (z.B. wenn ein Spieler sein Passwort vergessen hat).
- Das in `.env` über `INITIAL_MANAGER_PASSWORD` gesetzte (oder das Standard-)Passwort des ersten
  Manager-Zugangs ist nur ein **Startpasswort** — bitte direkt nach dem ersten Login unter **Profil →
  Passwort ändern** durch ein eigenes ersetzen.
- Wer `npm run db:seed:demo` zum Ausprobieren nutzt: die dort dokumentierten Demo-Passwörter sind
  **ausschließlich für lokale Tests** gedacht und dürfen nie in einem öffentlich erreichbaren
  Deployment aktiv bleiben — vor dem echten Betrieb `npm run db:reset && npm run db:seed` ausführen.
- Vor einem echten Produktivbetrieb außerdem:
  1. ein neuer, zufälliger `NEXTAUTH_SECRET` gesetzt werden,
  2. echte, individuelle Zugänge für alle Teammitglieder angelegt werden (**Admin/Manager → Kader →
     Spieler hinzufügen**, das generiert automatisch ein zufälliges Startpasswort, das direkt angezeigt
     wird, um es sicher weiterzugeben).

## Bekannte Grenzen & mögliche Erweiterungen

Diese App deckt den kompletten in der Aufgabenstellung beschriebenen Funktionsumfang ab. Für den
Weiterausbau in Richtung eines noch größeren Teams bieten sich u.a. an:

- E-Mail-/Push-Benachrichtigungen zusätzlich zum In-App-Center (z.B. über Resend/Discord-Webhook)
- Drag-and-drop (statt Klick-Auswahl) im Aufstellungs-Editor
- Mehrsprachigkeit (aktuell komplett auf Deutsch ausgelegt)
- Kalender-Export (ICS) für Spieltage
- Statistik-Dashboards mit Diagrammen (z.B. Formkurve, Spielerbewertungen pro Spiel)

---

© SV Wacker Burghausen eSports — internes Team-Management-System.

/**
 * DEMO-Seed-Skript: befüllt die Datenbank mit einem vollständigen Beispiel-Kader,
 * Beispiel-Spielen, Aufstellungen usw. — NUR zum Ausprobieren/Testen der App gedacht.
 *
 * Für den echten Betrieb (leerer Kader, nur ein Manager-Zugang) stattdessen
 * "npm run db:seed" (prisma/seed.ts) verwenden.
 *
 * Ausführen mit: npm run db:seed:demo
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

type SeedPlayer = {
  email: string;
  password: string;
  name: string;
  role: "PLAYER" | "CAPTAIN" | "MANAGER";
  gamerTag: string;
  primaryPosition: string | null;
  secondaryPosition?: string;
  squadRole: "STAMMSPIELER" | "ERSATZSPIELER" | "CAPTAIN" | "MANAGER" | "COACH";
  status?: "AVAILABLE" | "UNAVAILABLE" | "INJURED";
  jerseyNumber?: number;
  bio?: string;
};

const PLAYERS: SeedPlayer[] = [
  {
    email: "manager@wacker-esports.de",
    password: "Manager2026!",
    name: "Julia Berger",
    role: "MANAGER",
    gamerTag: "JuliaManagesIt",
    primaryPosition: null,
    squadRole: "MANAGER",
    jerseyNumber: undefined,
    bio: "Teammanagerin von SV Wacker Burghausen eSports. Verantwortlich für Kader, Spielplan und Organisation.",
  },
  {
    email: "captain@wacker-esports.de",
    password: "Captain2026!",
    name: "Fabian Huber",
    role: "CAPTAIN",
    gamerTag: "CaptainFabi",
    primaryPosition: "ZM",
    squadRole: "CAPTAIN",
    status: "AVAILABLE",
    jerseyNumber: 8,
    bio: "Spielführer im zentralen Mittelfeld. Verantwortlich für Aufstellung und Taktik am Spieltag.",
  },
  {
    email: "player@wacker-esports.de",
    password: "Player2026!",
    name: "Luca Wagner",
    role: "PLAYER",
    gamerTag: "SharpShooterLW",
    primaryPosition: "ST",
    squadRole: "STAMMSPIELER",
    status: "AVAILABLE",
    jerseyNumber: 9,
    bio: "Mittelstürmer mit Top-Abschlussquote. Seit 2023 im Kader.",
  },
  {
    email: "simon.brandner@wacker-esports.de",
    password: "Wacker2026!",
    name: "Simon Brandner",
    role: "PLAYER",
    gamerTag: "SiBrandner",
    primaryPosition: "TW",
    squadRole: "STAMMSPIELER",
    jerseyNumber: 1,
  },
  {
    email: "tobias.lehner@wacker-esports.de",
    password: "Wacker2026!",
    name: "Tobias Lehner",
    role: "PLAYER",
    gamerTag: "TobiLehner19",
    primaryPosition: "IV",
    squadRole: "STAMMSPIELER",
    jerseyNumber: 4,
  },
  {
    email: "maximilian.gruber@wacker-esports.de",
    password: "Wacker2026!",
    name: "Maximilian Gruber",
    role: "PLAYER",
    gamerTag: "MaxGruberX",
    primaryPosition: "IV",
    squadRole: "STAMMSPIELER",
    jerseyNumber: 5,
  },
  {
    email: "jonas.aigner@wacker-esports.de",
    password: "Wacker2026!",
    name: "Jonas Aigner",
    role: "PLAYER",
    gamerTag: "JonasAigner",
    primaryPosition: "LV",
    squadRole: "ERSATZSPIELER",
    status: "AVAILABLE",
    jerseyNumber: 15,
  },
  {
    email: "niklas.steiner@wacker-esports.de",
    password: "Wacker2026!",
    name: "Niklas Steiner",
    role: "PLAYER",
    gamerTag: "NikSteiner",
    primaryPosition: "RV",
    squadRole: "STAMMSPIELER",
    jerseyNumber: 2,
  },
  {
    email: "kevin.wimmer@wacker-esports.de",
    password: "Wacker2026!",
    name: "Kevin Wimmer",
    role: "PLAYER",
    gamerTag: "KevWimmer",
    primaryPosition: "ZDM",
    squadRole: "STAMMSPIELER",
    jerseyNumber: 6,
  },
  {
    email: "paul.reiter@wacker-esports.de",
    password: "Wacker2026!",
    name: "Paul Reiter",
    role: "PLAYER",
    gamerTag: "PaulReiterPro",
    primaryPosition: "ZOM",
    squadRole: "ERSATZSPIELER",
    jerseyNumber: 21,
  },
  {
    email: "david.mayr@wacker-esports.de",
    password: "Wacker2026!",
    name: "David Mayr",
    role: "PLAYER",
    gamerTag: "DavidMayrFC",
    primaryPosition: "LM",
    squadRole: "STAMMSPIELER",
    jerseyNumber: 11,
  },
  {
    email: "sebastian.hofer@wacker-esports.de",
    password: "Wacker2026!",
    name: "Sebastian Hofer",
    role: "PLAYER",
    gamerTag: "SebiHofer",
    primaryPosition: "RM",
    squadRole: "ERSATZSPIELER",
    status: "INJURED",
    jerseyNumber: 17,
    bio: "Pausiert aktuell wegen einer Handgelenksverletzung (Voraussichtlich wieder verfügbar in 2 Wochen).",
  },
  {
    email: "florian.wimmer@wacker-esports.de",
    password: "Wacker2026!",
    name: "Florian Wimmer",
    role: "PLAYER",
    gamerTag: "FloWimmer",
    primaryPosition: "LF",
    squadRole: "STAMMSPIELER",
    jerseyNumber: 7,
  },
  {
    email: "andreas.koller@wacker-esports.de",
    password: "Wacker2026!",
    name: "Andreas Koller",
    role: "PLAYER",
    gamerTag: "AndyKoller",
    primaryPosition: "RF",
    squadRole: "ERSATZSPIELER",
    jerseyNumber: 19,
  },
  {
    email: "michael.riedl@wacker-esports.de",
    password: "Wacker2026!",
    name: "Michael Riedl",
    role: "PLAYER",
    gamerTag: "MikeRiedl",
    primaryPosition: "ST",
    squadRole: "ERSATZSPIELER",
    jerseyNumber: 23,
  },
  {
    email: "christian.bauer@wacker-esports.de",
    password: "Wacker2026!",
    name: "Christian Bauer",
    role: "PLAYER",
    gamerTag: "ChrisBauerCoach",
    primaryPosition: null,
    squadRole: "COACH",
    bio: "Analysiert Gegner, unterstützt den Captain bei der taktischen Vorbereitung.",
  },
];

async function main() {
  console.log("🌱 Lösche vorhandene Daten ...");
  await prisma.notification.deleteMany();
  await prisma.lineupSlot.deleteMany();
  await prisma.lineup.deleteMany();
  await prisma.tactic.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.weeklyAvailability.deleteMany();
  await prisma.match.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Erstelle Benutzer & Spielerprofile ...");
  const userMap = new Map<string, { userId: string; playerId: string }>();

  for (const p of PLAYERS) {
    const user = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash: await hash(p.password),
        name: p.name,
        role: p.role,
      },
    });
    const player = await prisma.player.create({
      data: {
        userId: user.id,
        gamerTag: p.gamerTag,
        realName: p.name,
        primaryPosition: p.primaryPosition,
        secondaryPosition: p.secondaryPosition,
        squadRole: p.squadRole,
        status: p.status ?? "AVAILABLE",
        jerseyNumber: p.jerseyNumber,
        bio: p.bio,
        avatarUrl: null,
      },
    });
    userMap.set(p.email, { userId: user.id, playerId: player.id });
  }

  const byEmail = (email: string) => userMap.get(email)!;
  const manager = byEmail("manager@wacker-esports.de");
  const captain = byEmail("captain@wacker-esports.de");

  // Ein paar Beispiel-Einträge für die wöchentliche Standardverfügbarkeit
  await prisma.weeklyAvailability.create({
    data: {
      playerId: byEmail("player@wacker-esports.de").playerId,
      weekday: 2,
      fromTime: "19:00",
      toTime: "23:00",
      note: "Nach der Arbeit meist verfügbar",
    },
  });
  await prisma.weeklyAvailability.create({
    data: {
      playerId: captain.playerId,
      weekday: 5,
      fromTime: "17:00",
      toTime: "23:59",
    },
  });

  console.log("🏆 Erstelle Wettbewerbe ...");
  const vbl = await prisma.competition.create({
    data: { name: "Virtuelle Bundesliga (VBL Club Championship)", season: "2025/26" },
  });
  const pokal = await prisma.competition.create({
    data: { name: "eFootball Pokal", season: "2025/26" },
  });

  console.log("📅 Erstelle Spiele ...");

  const allPlayerEmails = PLAYERS.filter((p) => p.role !== "MANAGER").map((p) => p.email);

  // --- Vergangene Spiele (mit Ergebnis) ---------------------------------
  const past = [
    {
      opponent: "FC Nordstern eSports",
      date: "2026-07-18T18:00:00",
      competition: vbl,
      matchdayLabel: "Spieltag 3",
      homeAway: "HOME",
      own: 3,
      opp: 1,
    },
    {
      opponent: "Blau-Weiß Digital",
      date: "2026-07-25T19:00:00",
      competition: vbl,
      matchdayLabel: "Spieltag 4",
      homeAway: "AWAY",
      own: 1,
      opp: 1,
    },
    {
      opponent: "1. FC eSport Rosenheim",
      date: "2026-08-01T18:30:00",
      competition: pokal,
      matchdayLabel: "Achtelfinale",
      homeAway: "HOME",
      own: 2,
      opp: 0,
    },
    {
      opponent: "SG Dynamo Netz",
      date: "2026-08-08T19:00:00",
      competition: vbl,
      matchdayLabel: "Spieltag 5",
      homeAway: "AWAY",
      own: 0,
      opp: 2,
    },
    {
      opponent: "TSV Pixelburg",
      date: "2026-08-15T18:00:00",
      competition: vbl,
      matchdayLabel: "Spieltag 6",
      homeAway: "HOME",
      own: 4,
      opp: 2,
    },
  ];

  const pastMatchIds: string[] = [];
  for (const m of past) {
    const match = await prisma.match.create({
      data: {
        opponent: m.opponent,
        date: new Date(m.date),
        competitionId: m.competition.id,
        matchdayLabel: m.matchdayLabel,
        homeAway: m.homeAway,
        status: "PLAYED",
        resultOwnScore: m.own,
        resultOpponentScore: m.opp,
        createdById: manager.userId,
      },
    });
    pastMatchIds.push(match.id);

    // Zu-/Absagen für vergangene Spiele (alle akzeptiert, damit Statistik stimmt)
    await prisma.availability.createMany({
      data: allPlayerEmails.map((email) => ({
        matchId: match.id,
        playerId: byEmail(email).playerId,
        status: "ACCEPTED",
        respondedAt: new Date(m.date),
      })),
    });
  }

  // Abgesagtes Spiel
  await prisma.match.create({
    data: {
      opponent: "TSV Offline eSports",
      date: new Date("2026-08-18T19:00:00"),
      competitionId: vbl.id,
      matchdayLabel: "Nachholspiel",
      homeAway: "AWAY",
      status: "CANCELLED",
      notes: "Server-Ausfall beim Gegner – Spiel wird zu einem späteren Zeitpunkt nachgeholt.",
      createdById: manager.userId,
    },
  });

  // Volle Aufstellung + Taktik für das letzte gespielte Spiel (zur Ansicht "vergangene Aufstellung")
  const lastPlayedMatchId = pastMatchIds[pastMatchIds.length - 1];
  const starters4331: [string, string][] = [
    ["TW", "simon.brandner@wacker-esports.de"],
    ["IV1", "tobias.lehner@wacker-esports.de"],
    ["IV2", "maximilian.gruber@wacker-esports.de"],
    ["IV3", "niklas.steiner@wacker-esports.de"],
    ["LM", "david.mayr@wacker-esports.de"],
    ["ZM1", "kevin.wimmer@wacker-esports.de"],
    ["ZM2", "captain@wacker-esports.de"],
    ["RM", "sebastian.hofer@wacker-esports.de"],
    ["LF", "florian.wimmer@wacker-esports.de"],
    ["ST", "player@wacker-esports.de"],
    ["RF", "andreas.koller@wacker-esports.de"],
  ];
  const bench = ["jonas.aigner@wacker-esports.de", "paul.reiter@wacker-esports.de", "michael.riedl@wacker-esports.de"];

  const pastLineup = await prisma.lineup.create({
    data: {
      matchId: lastPlayedMatchId,
      formation: "4-3-3",
      published: true,
      publishedAt: new Date("2026-08-14T20:00:00"),
      updatedById: captain.userId,
      slots: {
        create: [
          ...starters4331.map(([slotKey, email], i) => ({
            slotKey,
            isStarter: true,
            order: i,
            playerId: byEmail(email).playerId,
          })),
          ...bench.map((email, i) => ({
            slotKey: `SUB${i + 1}`,
            isStarter: false,
            order: i,
            playerId: byEmail(email).playerId,
          })),
        ],
      },
    },
  });

  await prisma.tactic.create({
    data: {
      matchId: lastPlayedMatchId,
      formation: "4-3-3",
      style: "OFFENSIVE",
      pressing: "HIGH",
      tempo: "FAST",
      instructions:
        "Hohes Anlaufen direkt nach Ballverlust, schnelles Umschaltspiel über die Flügel. LF und RF ziehen früh in die Tiefe, ZM2 (Captain) rückt bei Ballbesitz nach vorne auf.",
      updatedById: captain.userId,
    },
  });

  // --- Nächstes Spiel: Aufstellung im Entwurf, Zu-/Absagen offen ---------
  const nextMatch = await prisma.match.create({
    data: {
      opponent: "FC Rhein Elektronik",
      date: new Date("2026-08-23T19:00:00"),
      competitionId: vbl.id,
      matchdayLabel: "Spieltag 7",
      homeAway: "HOME",
      status: "LINEUP_OPEN",
      streamUrl: "https://twitch.tv/wacker_esports",
      createdById: manager.userId,
    },
  });

  const availabilityPattern: Record<string, "ACCEPTED" | "DECLINED" | "PENDING"> = {
    "player@wacker-esports.de": "ACCEPTED",
    "captain@wacker-esports.de": "ACCEPTED",
    "simon.brandner@wacker-esports.de": "ACCEPTED",
    "tobias.lehner@wacker-esports.de": "ACCEPTED",
    "maximilian.gruber@wacker-esports.de": "ACCEPTED",
    "niklas.steiner@wacker-esports.de": "ACCEPTED",
    "kevin.wimmer@wacker-esports.de": "ACCEPTED",
    "david.mayr@wacker-esports.de": "ACCEPTED",
    "florian.wimmer@wacker-esports.de": "ACCEPTED",
    "jonas.aigner@wacker-esports.de": "ACCEPTED",
    "andreas.koller@wacker-esports.de": "PENDING",
    "michael.riedl@wacker-esports.de": "PENDING",
    "paul.reiter@wacker-esports.de": "DECLINED",
    "sebastian.hofer@wacker-esports.de": "DECLINED",
  };

  for (const [email, status] of Object.entries(availabilityPattern)) {
    await prisma.availability.create({
      data: {
        matchId: nextMatch.id,
        playerId: byEmail(email).playerId,
        status,
        reason:
          status === "DECLINED"
            ? email === "paul.reiter@wacker-esports.de"
              ? "Beruflich verhindert"
              : "Verletzung noch nicht ausgeheilt"
            : undefined,
        respondedAt: status === "PENDING" ? null : new Date("2026-08-21T12:00:00"),
      },
    });
  }

  // Entwurfs-Aufstellung für das nächste Spiel (noch nicht veröffentlicht)
  const draftStarters: [string, string][] = [
    ["TW", "simon.brandner@wacker-esports.de"],
    ["IV1", "tobias.lehner@wacker-esports.de"],
    ["IV2", "maximilian.gruber@wacker-esports.de"],
    ["IV3", "niklas.steiner@wacker-esports.de"],
    ["LM", "david.mayr@wacker-esports.de"],
    ["ZM1", "kevin.wimmer@wacker-esports.de"],
    ["ZM2", "captain@wacker-esports.de"],
    ["RM", "jonas.aigner@wacker-esports.de"],
    ["LF", "florian.wimmer@wacker-esports.de"],
    ["ST", "player@wacker-esports.de"],
  ];

  await prisma.lineup.create({
    data: {
      matchId: nextMatch.id,
      formation: "4-3-3",
      published: false,
      updatedById: captain.userId,
      slots: {
        create: draftStarters.map(([slotKey, email], i) => ({
          slotKey,
          isStarter: true,
          order: i,
          playerId: byEmail(email).playerId,
        })),
      },
    },
  });

  await prisma.tactic.create({
    data: {
      matchId: nextMatch.id,
      formation: "4-3-3",
      style: "BALANCED",
      pressing: "MID",
      tempo: "NORMAL",
      instructions:
        "Kompakt stehen, Gegner über die Mitte einladen und dann Ballgewinne im Mittelfeld für schnelle Kontereinleiten. Bei Standards RF als zusätzlicher Kopfballpunkt mit einrücken.",
      updatedById: captain.userId,
    },
  });

  // --- Weitere kommende Spiele --------------------------------------------
  await prisma.match.create({
    data: {
      opponent: "1. FC Talstadt",
      date: new Date("2026-08-30T18:00:00"),
      competitionId: pokal.id,
      matchdayLabel: "Viertelfinale",
      homeAway: "AWAY",
      status: "SCHEDULED",
      createdById: manager.userId,
    },
  });
  await prisma.match.create({
    data: {
      opponent: "SV Grünwald Digital",
      date: new Date("2026-09-06T19:00:00"),
      competitionId: vbl.id,
      matchdayLabel: "Spieltag 8",
      homeAway: "HOME",
      status: "SCHEDULED",
      createdById: manager.userId,
    },
  });
  await prisma.match.create({
    data: {
      opponent: "FC Server Crash",
      date: new Date("2026-09-13T19:00:00"),
      competitionId: vbl.id,
      matchdayLabel: "Spieltag 9",
      homeAway: "AWAY",
      status: "SCHEDULED",
      createdById: manager.userId,
    },
  });

  console.log("🔔 Erstelle Benachrichtigungen ...");
  const allUserIds = Array.from(userMap.values()).map((v) => v.userId);

  await prisma.notification.createMany({
    data: [
      ...allUserIds.map((userId) => ({
        userId,
        type: "MATCHDAY_CREATED",
        title: "Neuer Spieltag wurde erstellt",
        message: "Spieltag 7 gegen FC Rhein Elektronik (23.08.2026, 19:00 Uhr) wurde angelegt.",
        link: `/spielplan/${nextMatch.id}`,
      })),
      {
        userId: byEmail("player@wacker-esports.de").userId,
        type: "SELECTED",
        title: "Du wurdest für das nächste Spiel ausgewählt",
        message: "Du stehst im Entwurf der Startaufstellung gegen FC Rhein Elektronik (ST).",
        link: `/aufstellung/${nextMatch.id}`,
      },
      {
        userId: byEmail("player@wacker-esports.de").userId,
        type: "LINEUP_PUBLISHED",
        title: "Die Aufstellung wurde veröffentlicht",
        message: "Die Startaufstellung gegen TSV Pixelburg wurde veröffentlicht. Du stehst als ST in der Startelf.",
        link: `/aufstellung/${lastPlayedMatchId}`,
      },
      ...allUserIds.map((userId) => ({
        userId,
        type: "TACTIC_UPDATED",
        title: "Die Taktik wurde aktualisiert",
        message: "Fabian Huber hat die Taktik für das Spiel gegen FC Rhein Elektronik angepasst (4-3-3, ausgeglichen).",
        link: `/taktik/${nextMatch.id}`,
      })),
      ...allUserIds.map((userId) => ({
        userId,
        type: "MATCH_REMINDER",
        title: "Spieltag beginnt morgen",
        message: "Erinnerung: Das Spiel gegen FC Rhein Elektronik findet morgen um 19:00 Uhr statt.",
        link: `/spielplan/${nextMatch.id}`,
      })),
      {
        userId: manager.userId,
        type: "PLAYER_DECLINED",
        title: "Ein Spieler hat für das Spiel abgesagt",
        message: "Paul Reiter hat für das Spiel gegen FC Rhein Elektronik abgesagt (Grund: Beruflich verhindert).",
        link: `/spielplan/${nextMatch.id}`,
      },
      {
        userId: captain.userId,
        type: "PLAYER_DECLINED",
        title: "Ein Spieler hat für das Spiel abgesagt",
        message: "Sebastian Hofer hat für das Spiel gegen FC Rhein Elektronik abgesagt (Grund: Verletzung noch nicht ausgeheilt).",
        link: `/spielplan/${nextMatch.id}`,
      },
      {
        userId: manager.userId,
        type: "RESULT_ENTERED",
        title: "Ergebnis eingetragen",
        message: "Das Ergebnis gegen TSV Pixelburg (4:2) wurde eingetragen.",
        link: `/spielplan/${lastPlayedMatchId}`,
      },
    ],
  });

  console.log("✅ Seed abgeschlossen.");
  console.log("");
  console.log("Demo-Zugänge:");
  console.log("  Manager:  manager@wacker-esports.de  /  Manager2026!");
  console.log("  Captain:  captain@wacker-esports.de  /  Captain2026!");
  console.log("  Spieler:  player@wacker-esports.de   /  Player2026!");
  console.log("  (weitere Testspieler: <vorname>.<nachname>@wacker-esports.de / Wacker2026!)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

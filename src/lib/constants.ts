// Zentrale Definitionen für Rollen, Positionen, Status etc.
// Da Prisma-Enums (wegen SQLite-Kompatibilität) als String gespeichert werden,
// ist diese Datei die "Quelle der Wahrheit" für gültige Werte im gesamten Code.

export const SYSTEM_ROLES = ["PLAYER", "CAPTAIN", "MANAGER"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  PLAYER: "Spieler",
  CAPTAIN: "Captain",
  MANAGER: "Manager / Admin",
};

export const SQUAD_ROLES = [
  "STAMMSPIELER",
  "ERSATZSPIELER",
  "CAPTAIN",
  "MANAGER",
  "COACH",
] as const;
export type SquadRole = (typeof SQUAD_ROLES)[number];

export const SQUAD_ROLE_LABELS: Record<SquadRole, string> = {
  STAMMSPIELER: "Stammspieler",
  ERSATZSPIELER: "Ersatzspieler",
  CAPTAIN: "Captain",
  MANAGER: "Manager",
  COACH: "Coach",
};

export const PLAYER_STATUS = ["AVAILABLE", "UNAVAILABLE", "INJURED"] as const;
export type PlayerStatus = (typeof PLAYER_STATUS)[number];

export const PLAYER_STATUS_LABELS: Record<PlayerStatus, string> = {
  AVAILABLE: "Verfügbar",
  UNAVAILABLE: "Nicht verfügbar",
  INJURED: "Verletzt/Pausiert",
};

// Positionen im Stil eines Fußball-eSports-Teams (EA SPORTS FC / Konsolen-Liga)
export const POSITIONS = [
  "TW",
  "IV",
  "LV",
  "RV",
  "ZDM",
  "ZM",
  "ZOM",
  "LM",
  "RM",
  "LF",
  "RF",
  "ST",
] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_LABELS: Record<Position, string> = {
  TW: "Torwart",
  IV: "Innenverteidiger",
  LV: "Linksverteidiger",
  RV: "Rechtsverteidiger",
  ZDM: "Defensives Mittelfeld",
  ZM: "Zentrales Mittelfeld",
  ZOM: "Offensives Mittelfeld",
  LM: "Linkes Mittelfeld",
  RM: "Rechtes Mittelfeld",
  LF: "Linker Flügel",
  RF: "Rechter Flügel",
  ST: "Sturm",
};

export const MATCH_STATUS = [
  "SCHEDULED",
  "LINEUP_OPEN",
  "LINEUP_PUBLISHED",
  "PLAYED",
  "CANCELLED",
] as const;
export type MatchStatus = (typeof MATCH_STATUS)[number];

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "Geplant",
  LINEUP_OPEN: "Aufstellung offen",
  LINEUP_PUBLISHED: "Aufstellung veröffentlicht",
  PLAYED: "Gespielt",
  CANCELLED: "Abgesagt",
};

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  SCHEDULED: "bg-ink-600 text-ink-100",
  LINEUP_OPEN: "bg-amber-500/15 text-amber-400",
  LINEUP_PUBLISHED: "bg-emerald-500/15 text-emerald-400",
  PLAYED: "bg-sky-500/15 text-sky-400",
  CANCELLED: "bg-rose-500/15 text-rose-400",
};

export const AVAILABILITY_STATUS = ["ACCEPTED", "DECLINED", "PENDING"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUS)[number];

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  ACCEPTED: "Zugesagt",
  DECLINED: "Abgesagt",
  PENDING: "Keine Antwort",
};

export const HOME_AWAY = ["HOME", "AWAY"] as const;
export type HomeAway = (typeof HOME_AWAY)[number];
export const HOME_AWAY_LABELS: Record<HomeAway, string> = {
  HOME: "Heim",
  AWAY: "Auswärts",
};

// Vollständige Formationsauswahl (angelehnt an die gängigen eSports/EA-FC-Formationen) —
// bewusst umfassend, damit Captain/Manager für jede Taktik die passende Formation wählen können.
export const FORMATIONS = [
  "4-3-3",
  "4-4-2",
  "4-4-2 Raute",
  "4-2-3-1",
  "4-1-4-1",
  "4-1-2-1-2",
  "4-3-1-2",
  "3-5-2",
  "3-4-3",
  "5-3-2",
  "5-4-1",
] as const;
export type Formation = (typeof FORMATIONS)[number];

// Slot-Layout je Formation: slotKey -> { label, x, y } (x/y in % auf dem Spielfeld)
export type FormationSlot = { key: string; label: string; x: number; y: number };

export const FORMATION_LAYOUTS: Record<Formation, FormationSlot[]> = {
  "4-3-3": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 14, y: 74 },
    { key: "IV1", label: "IV", x: 34, y: 78 },
    { key: "IV2", label: "IV", x: 66, y: 78 },
    { key: "RV", label: "RV", x: 86, y: 74 },
    { key: "ZM1", label: "ZM", x: 30, y: 54 },
    { key: "ZDM", label: "ZDM", x: 50, y: 60 },
    { key: "ZM2", label: "ZM", x: 70, y: 54 },
    { key: "LF", label: "LF", x: 22, y: 22 },
    { key: "ST", label: "ST", x: 50, y: 14 },
    { key: "RF", label: "RF", x: 78, y: 22 },
  ],
  "4-4-2": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 12, y: 74 },
    { key: "IV1", label: "IV", x: 34, y: 78 },
    { key: "IV2", label: "IV", x: 66, y: 78 },
    { key: "RV", label: "RV", x: 88, y: 74 },
    { key: "LM", label: "LM", x: 12, y: 50 },
    { key: "ZM1", label: "ZM", x: 38, y: 52 },
    { key: "ZM2", label: "ZM", x: 62, y: 52 },
    { key: "RM", label: "RM", x: 88, y: 50 },
    { key: "ST1", label: "ST", x: 38, y: 16 },
    { key: "ST2", label: "ST", x: 62, y: 16 },
  ],
  "4-4-2 Raute": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 14, y: 74 },
    { key: "IV1", label: "IV", x: 34, y: 78 },
    { key: "IV2", label: "IV", x: 66, y: 78 },
    { key: "RV", label: "RV", x: 86, y: 74 },
    { key: "ZDM", label: "ZDM", x: 50, y: 62 },
    { key: "ZM1", label: "ZM", x: 28, y: 50 },
    { key: "ZM2", label: "ZM", x: 72, y: 50 },
    { key: "ZOM", label: "ZOM", x: 50, y: 38 },
    { key: "ST1", label: "ST", x: 38, y: 16 },
    { key: "ST2", label: "ST", x: 62, y: 16 },
  ],
  "4-2-3-1": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 14, y: 74 },
    { key: "IV1", label: "IV", x: 34, y: 78 },
    { key: "IV2", label: "IV", x: 66, y: 78 },
    { key: "RV", label: "RV", x: 86, y: 74 },
    { key: "ZDM1", label: "ZDM", x: 38, y: 60 },
    { key: "ZDM2", label: "ZDM", x: 62, y: 60 },
    { key: "LM", label: "LM", x: 16, y: 40 },
    { key: "ZOM", label: "ZOM", x: 50, y: 36 },
    { key: "RM", label: "RM", x: 84, y: 40 },
    { key: "ST", label: "ST", x: 50, y: 14 },
  ],
  "4-1-4-1": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 14, y: 74 },
    { key: "IV1", label: "IV", x: 34, y: 78 },
    { key: "IV2", label: "IV", x: 66, y: 78 },
    { key: "RV", label: "RV", x: 86, y: 74 },
    { key: "ZDM", label: "ZDM", x: 50, y: 62 },
    { key: "LM", label: "LM", x: 12, y: 46 },
    { key: "ZM1", label: "ZM", x: 36, y: 48 },
    { key: "ZM2", label: "ZM", x: 64, y: 48 },
    { key: "RM", label: "RM", x: 88, y: 46 },
    { key: "ST", label: "ST", x: 50, y: 16 },
  ],
  "4-1-2-1-2": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 14, y: 74 },
    { key: "IV1", label: "IV", x: 34, y: 78 },
    { key: "IV2", label: "IV", x: 66, y: 78 },
    { key: "RV", label: "RV", x: 86, y: 74 },
    { key: "ZDM", label: "ZDM", x: 50, y: 64 },
    { key: "ZM1", label: "ZM", x: 32, y: 50 },
    { key: "ZM2", label: "ZM", x: 68, y: 50 },
    { key: "ZOM", label: "ZOM", x: 50, y: 38 },
    { key: "ST1", label: "ST", x: 38, y: 16 },
    { key: "ST2", label: "ST", x: 62, y: 16 },
  ],
  "4-3-1-2": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 14, y: 74 },
    { key: "IV1", label: "IV", x: 34, y: 78 },
    { key: "IV2", label: "IV", x: 66, y: 78 },
    { key: "RV", label: "RV", x: 86, y: 74 },
    { key: "ZM1", label: "ZM", x: 26, y: 54 },
    { key: "ZM2", label: "ZM", x: 50, y: 58 },
    { key: "ZM3", label: "ZM", x: 74, y: 54 },
    { key: "ZOM", label: "ZOM", x: 50, y: 38 },
    { key: "ST1", label: "ST", x: 38, y: 16 },
    { key: "ST2", label: "ST", x: 62, y: 16 },
  ],
  "3-5-2": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "IV1", label: "IV", x: 30, y: 78 },
    { key: "IV2", label: "IV", x: 50, y: 80 },
    { key: "IV3", label: "IV", x: 70, y: 78 },
    { key: "LM", label: "LM", x: 10, y: 50 },
    { key: "ZM1", label: "ZM", x: 32, y: 54 },
    { key: "ZDM", label: "ZDM", x: 50, y: 60 },
    { key: "ZM2", label: "ZM", x: 68, y: 54 },
    { key: "RM", label: "RM", x: 90, y: 50 },
    { key: "ST1", label: "ST", x: 38, y: 16 },
    { key: "ST2", label: "ST", x: 62, y: 16 },
  ],
  "3-4-3": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "IV1", label: "IV", x: 30, y: 78 },
    { key: "IV2", label: "IV", x: 50, y: 80 },
    { key: "IV3", label: "IV", x: 70, y: 78 },
    { key: "LM", label: "LM", x: 12, y: 52 },
    { key: "ZM1", label: "ZM", x: 38, y: 54 },
    { key: "ZM2", label: "ZM", x: 62, y: 54 },
    { key: "RM", label: "RM", x: 88, y: 52 },
    { key: "LF", label: "LF", x: 22, y: 20 },
    { key: "ST", label: "ST", x: 50, y: 14 },
    { key: "RF", label: "RF", x: 78, y: 20 },
  ],
  "5-3-2": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 10, y: 72 },
    { key: "IV1", label: "IV", x: 30, y: 78 },
    { key: "IV2", label: "IV", x: 50, y: 80 },
    { key: "IV3", label: "IV", x: 70, y: 78 },
    { key: "RV", label: "RV", x: 90, y: 72 },
    { key: "ZM1", label: "ZM", x: 30, y: 50 },
    { key: "ZM2", label: "ZM", x: 50, y: 46 },
    { key: "ZM3", label: "ZM", x: 70, y: 50 },
    { key: "ST1", label: "ST", x: 38, y: 16 },
    { key: "ST2", label: "ST", x: 62, y: 16 },
  ],
  "5-4-1": [
    { key: "TW", label: "TW", x: 50, y: 92 },
    { key: "LV", label: "LV", x: 10, y: 72 },
    { key: "IV1", label: "IV", x: 30, y: 78 },
    { key: "IV2", label: "IV", x: 50, y: 80 },
    { key: "IV3", label: "IV", x: 70, y: 78 },
    { key: "RV", label: "RV", x: 90, y: 72 },
    { key: "LM", label: "LM", x: 14, y: 48 },
    { key: "ZM1", label: "ZM", x: 38, y: 50 },
    { key: "ZM2", label: "ZM", x: 62, y: 50 },
    { key: "RM", label: "RM", x: 86, y: 48 },
    { key: "ST", label: "ST", x: 50, y: 14 },
  ],
};

export const SUBSTITUTE_SLOTS = 7; // Anzahl Ersatzbank-Plätze

export const TACTIC_STYLE = ["OFFENSIVE", "BALANCED", "DEFENSIVE"] as const;
export type TacticStyle = (typeof TACTIC_STYLE)[number];
export const TACTIC_STYLE_LABELS: Record<TacticStyle, string> = {
  OFFENSIVE: "Offensiv",
  BALANCED: "Ausgeglichen",
  DEFENSIVE: "Defensiv",
};

export const TACTIC_PRESSING = ["HIGH", "MID", "LOW"] as const;
export type TacticPressing = (typeof TACTIC_PRESSING)[number];
export const TACTIC_PRESSING_LABELS: Record<TacticPressing, string> = {
  HIGH: "Hoch",
  MID: "Mittel",
  LOW: "Tief",
};

export const TACTIC_TEMPO = ["SLOW", "NORMAL", "FAST"] as const;
export type TacticTempo = (typeof TACTIC_TEMPO)[number];
export const TACTIC_TEMPO_LABELS: Record<TacticTempo, string> = {
  SLOW: "Langsam",
  NORMAL: "Normal",
  FAST: "Schnell",
};

export const NOTIFICATION_TYPES = [
  "MATCHDAY_CREATED",
  "SELECTED",
  "LINEUP_PUBLISHED",
  "TACTIC_UPDATED",
  "MATCH_REMINDER",
  "PLAYER_DECLINED",
  "RESULT_ENTERED",
  "TRAINING_CREATED",
  "GENERAL",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const WEEKDAYS = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

// Rollen, die Captain-Rechte besitzen (Captain + Manager)
export function canManageMatchOps(role: string) {
  return role === "CAPTAIN" || role === "MANAGER";
}

export function isManager(role: string) {
  return role === "MANAGER";
}

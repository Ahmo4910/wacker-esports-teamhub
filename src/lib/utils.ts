import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const dateFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateLongFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(d: Date | string) {
  return dateFmt.format(new Date(d));
}

export function formatDateLong(d: Date | string) {
  return dateLongFmt.format(new Date(d));
}

export function formatTime(d: Date | string) {
  return timeFmt.format(new Date(d));
}

export function formatDateTime(d: Date | string) {
  return `${formatDate(d)} · ${formatTime(d)} Uhr`;
}

export function relativeDay(d: Date | string) {
  const date = new Date(d);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Morgen";
  if (diffDays === -1) return "Gestern";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} Tagen`;
  if (diffDays < -1 && diffDays >= -7) return `Vor ${Math.abs(diffDays)} Tagen`;
  return formatDate(date);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function matchOutcome(own?: number | null, opp?: number | null): "WIN" | "LOSS" | "DRAW" | null {
  if (own == null || opp == null) return null;
  if (own > opp) return "WIN";
  if (own < opp) return "LOSS";
  return "DRAW";
}

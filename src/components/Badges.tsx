import { cn } from "@/lib/utils";
import {
  AVAILABILITY_LABELS,
  AvailabilityStatus,
  MATCH_STATUS_COLORS,
  MATCH_STATUS_LABELS,
  MatchStatus,
  PLAYER_STATUS_LABELS,
  PlayerStatus,
  SQUAD_ROLE_LABELS,
  SquadRole,
} from "@/lib/constants";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";

export function MatchStatusBadge({ status }: { status: string }) {
  const s = status as MatchStatus;
  return (
    <span className={cn("badge", MATCH_STATUS_COLORS[s] ?? "bg-ink-600 text-ink-100")}>
      {MATCH_STATUS_LABELS[s] ?? status}
    </span>
  );
}

export function PlayerStatusBadge({ status }: { status: string }) {
  const s = status as PlayerStatus;
  const styles: Record<PlayerStatus, string> = {
    AVAILABLE: "bg-emerald-500/15 text-emerald-400",
    UNAVAILABLE: "bg-ink-600 text-ink-200",
    INJURED: "bg-rose-500/15 text-rose-400",
  };
  return <span className={cn("badge", styles[s] ?? "bg-ink-600 text-ink-200")}>{PLAYER_STATUS_LABELS[s] ?? status}</span>;
}

export function SquadRoleBadge({ role }: { role: string }) {
  const r = role as SquadRole;
  const styles: Record<SquadRole, string> = {
    CAPTAIN: "bg-wacker-red/15 text-wacker-red-light",
    MANAGER: "bg-amber-500/15 text-amber-400",
    COACH: "bg-violet-500/15 text-violet-400",
    STAMMSPIELER: "bg-sky-500/15 text-sky-400",
    ERSATZSPIELER: "bg-ink-600 text-ink-200",
  };
  return <span className={cn("badge", styles[r] ?? "bg-ink-600 text-ink-200")}>{SQUAD_ROLE_LABELS[r] ?? role}</span>;
}

export function AvailabilityBadge({ status }: { status: string }) {
  const s = status as AvailabilityStatus;
  if (s === "ACCEPTED")
    return (
      <span className="badge bg-emerald-500/15 text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" /> {AVAILABILITY_LABELS.ACCEPTED}
      </span>
    );
  if (s === "DECLINED")
    return (
      <span className="badge bg-rose-500/15 text-rose-400">
        <XCircle className="h-3.5 w-3.5" /> {AVAILABILITY_LABELS.DECLINED}
      </span>
    );
  return (
    <span className="badge bg-ink-600 text-ink-300">
      <Clock3 className="h-3.5 w-3.5" /> {AVAILABILITY_LABELS.PENDING}
    </span>
  );
}

export function OutcomeBadge({ outcome }: { outcome: "WIN" | "LOSS" | "DRAW" | null }) {
  if (!outcome) return null;
  const map = {
    WIN: { label: "Sieg", cls: "bg-emerald-500/15 text-emerald-400" },
    LOSS: { label: "Niederlage", cls: "bg-rose-500/15 text-rose-400" },
    DRAW: { label: "Unentschieden", cls: "bg-amber-500/15 text-amber-400" },
  }[outcome];
  return <span className={cn("badge", map.cls)}>{map.label}</span>;
}

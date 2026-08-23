"use client";

import { FORMATION_LAYOUTS, Formation, POSITION_LABELS, Position } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export type PitchPlayer = { id: string; gamerTag: string; avatarUrl: string | null; jerseyNumber?: number | null };

export function Pitch({
  formation,
  assignments,
  onSlotClick,
  selectedSlot,
  editable = false,
}: {
  formation: Formation;
  assignments: Record<string, PitchPlayer | null>;
  onSlotClick?: (slotKey: string) => void;
  selectedSlot?: string | null;
  editable?: boolean;
}) {
  const layout = FORMATION_LAYOUTS[formation];

  return (
    <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-emerald-950 to-emerald-900 shadow-inner">
      {/* Spielfeldlinien */}
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 150" preserveAspectRatio="none">
        <rect x="2" y="2" width="96" height="146" fill="none" stroke="white" strokeWidth="0.5" />
        <line x1="2" y1="75" x2="98" y2="75" stroke="white" strokeWidth="0.5" />
        <circle cx="50" cy="75" r="10" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="20" y="2" width="60" height="18" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="20" y="130" width="60" height="18" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="36" y="2" width="28" height="8" fill="none" stroke="white" strokeWidth="0.5" />
        <rect x="36" y="140" width="28" height="8" fill="none" stroke="white" strokeWidth="0.5" />
      </svg>

      {layout.map((slot) => {
        const p = assignments[slot.key] ?? null;
        const isSelected = selectedSlot === slot.key;
        return (
          <button
            key={slot.key}
            type="button"
            disabled={!editable}
            onClick={() => onSlotClick?.(slot.key)}
            title={p ? p.gamerTag : `${slot.label} — leer`}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            className={cn(
              "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1",
              editable && "cursor-pointer"
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg transition-all sm:h-12 sm:w-12",
                p
                  ? "border-white/40 bg-ink-900"
                  : "border-dashed border-white/30 bg-white/5",
                isSelected && "ring-4 ring-wacker-red/60"
              )}
            >
              {p ? (
                <Avatar name={p.gamerTag} src={p.avatarUrl} size="sm" className="h-full w-full" />
              ) : (
                <Plus className="h-4 w-4 text-white/50" />
              )}
            </div>
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              {slot.label}
            </span>
            {p && (
              <span className="max-w-[64px] truncate rounded bg-black/50 px-1 text-[9px] text-white/90">
                {p.gamerTag}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

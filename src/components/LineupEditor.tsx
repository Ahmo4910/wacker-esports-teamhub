"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pitch, PitchPlayer } from "@/components/Pitch";
import { Avatar } from "@/components/Avatar";
import { AvailabilityBadge } from "@/components/Badges";
import {
  FORMATIONS,
  FORMATION_LAYOUTS,
  Formation,
  SUBSTITUTE_SLOTS,
  POSITION_LABELS,
  Position,
} from "@/lib/constants";
import { CheckCircle2, Loader2, Rocket, Save, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

type RosterPlayer = PitchPlayer & {
  primaryPosition: string | null;
  availabilityStatus: "ACCEPTED" | "DECLINED" | "PENDING";
};

type SlotAssignment = { slotKey: string; isStarter: boolean; order: number; playerId: string | null };

export function LineupEditor({
  matchId,
  roster,
  initialFormation,
  initialSlots,
  initialPublished,
}: {
  matchId: string;
  roster: RosterPlayer[];
  initialFormation: Formation;
  initialSlots: SlotAssignment[];
  initialPublished: boolean;
}) {
  const router = useRouter();
  const [formation, setFormation] = useState<Formation>(initialFormation);
  const [starters, setStarters] = useState<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {};
    for (const s of initialSlots.filter((s) => s.isStarter)) map[s.slotKey] = s.playerId;
    return map;
  });
  const [bench, setBench] = useState<(string | null)[]>(() => {
    const arr: (string | null)[] = Array(SUBSTITUTE_SLOTS).fill(null);
    for (const s of initialSlots.filter((s) => !s.isStarter)) {
      const idx = s.order;
      if (idx >= 0 && idx < SUBSTITUTE_SLOTS) arr[idx] = s.playerId;
    }
    return arr;
  });
  const [selected, setSelected] = useState<{ type: "starter" | "bench"; key: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(initialPublished);
  const [error, setError] = useState<string | null>(null);

  const rosterById = useMemo(() => Object.fromEntries(roster.map((r) => [r.id, r])), [roster]);

  const assignedIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(starters).forEach((id) => id && ids.add(id));
    bench.forEach((id) => id && ids.add(id));
    return ids;
  }, [starters, bench]);

  const pitchAssignments: Record<string, PitchPlayer | null> = useMemo(() => {
    const map: Record<string, PitchPlayer | null> = {};
    for (const slot of FORMATION_LAYOUTS[formation]) {
      const pid = starters[slot.key];
      map[slot.key] = pid ? rosterById[pid] ?? null : null;
    }
    return map;
  }, [formation, starters, rosterById]);

  function handleFormationChange(f: Formation) {
    const newKeys = new Set(FORMATION_LAYOUTS[f].map((s) => s.key));
    setStarters((prev) => {
      const next: Record<string, string | null> = {};
      for (const key of newKeys) next[key] = prev[key] ?? null;
      return next;
    });
    setFormation(f);
    setSelected(null);
  }

  function assignPlayer(playerId: string) {
    if (!selected) return;
    // Entferne den Spieler aus einer eventuell vorherigen Position
    setStarters((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (next[k] === playerId) next[k] = null;
      if (selected.type === "starter") next[selected.key] = playerId;
      return next;
    });
    setBench((prev) => {
      const next = prev.map((id) => (id === playerId ? null : id));
      if (selected.type === "bench") {
        const idx = parseInt(selected.key, 10);
        next[idx] = playerId;
      }
      return next;
    });
    setSelected(null);
  }

  function clearSlot() {
    if (!selected) return;
    if (selected.type === "starter") setStarters((prev) => ({ ...prev, [selected.key]: null }));
    else
      setBench((prev) => {
        const next = [...prev];
        next[parseInt(selected.key, 10)] = null;
        return next;
      });
    setSelected(null);
  }

  function buildSlotPayload(): SlotAssignment[] {
    const slots: SlotAssignment[] = [];
    let order = 0;
    for (const layoutSlot of FORMATION_LAYOUTS[formation]) {
      slots.push({ slotKey: layoutSlot.key, isStarter: true, order: order++, playerId: starters[layoutSlot.key] ?? null });
    }
    bench.forEach((playerId, i) => {
      slots.push({ slotKey: `SUB${i + 1}`, isStarter: false, order: i, playerId });
    });
    return slots;
  }

  async function save(): Promise<boolean> {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/matches/${matchId}/lineup`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formation, slots: buildSlotPayload() }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Speichern fehlgeschlagen.");
      return false;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
    return true;
  }

  async function publish() {
    setPublishing(true);
    setError(null);
    const ok = await save();
    if (ok) {
      const res = await fetch(`/api/matches/${matchId}/lineup/publish`, { method: "POST" });
      if (res.ok) {
        setPublished(true);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Veröffentlichen fehlgeschlagen.");
      }
    }
    setPublishing(false);
  }

  const availableRoster = [...roster].sort((a, b) => {
    const rank = { ACCEPTED: 0, PENDING: 1, DECLINED: 2 };
    return rank[a.availabilityStatus] - rank[b.availabilityStatus] || a.gamerTag.localeCompare(b.gamerTag);
  });

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-300">Formation</label>
              <select value={formation} onChange={(e) => handleFormationChange(e.target.value as Formation)} className="select w-auto">
                {FORMATIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            {published && <span className="badge bg-emerald-500/15 text-emerald-400">Veröffentlicht</span>}
          </div>

          <Pitch
            formation={formation}
            assignments={pitchAssignments}
            editable
            onSlotClick={(key) => setSelected({ type: "starter", key })}
            selectedSlot={selected?.type === "starter" ? selected.key : null}
          />

          <p className="mt-3 text-center text-xs text-ink-400">
            Position auf dem Feld anklicken, dann rechts einen Spieler auswählen.
          </p>
        </div>

        <div className="card mt-5 p-5">
          <h3 className="section-title mb-3">Ersatzbank</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {bench.map((playerId, i) => {
              const p = playerId ? rosterById[playerId] : null;
              const isSelected = selected?.type === "bench" && selected.key === i.toString();
              return (
                <button
                  key={i}
                  onClick={() => setSelected({ type: "bench", key: i.toString() })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors",
                    p ? "border-white/10 bg-white/[0.03]" : "border-dashed border-white/15 bg-transparent",
                    isSelected && "border-wacker-red/60 ring-2 ring-wacker-red/30"
                  )}
                >
                  {p ? <Avatar name={p.gamerTag} src={p.avatarUrl} size="sm" /> : <Users className="h-6 w-6 text-ink-500" />}
                  <span className="max-w-full truncate text-[11px] text-ink-200">{p ? p.gamerTag : `Ersatz ${i + 1}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={save} disabled={saving} className="btn-secondary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Entwurf speichern
          </button>
          <button onClick={publish} disabled={publishing} className="btn-primary">
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            Aufstellung veröffentlichen
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Gespeichert
            </span>
          )}
        </div>
      </div>

      <div className="card h-fit p-5 lg:sticky lg:top-20">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="section-title">Kader</h3>
          {selected && (
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-ink-400 hover:text-white">
              <X className="h-3.5 w-3.5" /> Auswahl schließen
            </button>
          )}
        </div>
        {!selected && (
          <p className="mb-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-ink-400">
            Wähle zuerst eine Position auf dem Feld oder der Bank aus.
          </p>
        )}
        <div className="max-h-[520px] space-y-1.5 overflow-y-auto">
          {selected && (
            <button
              onClick={clearSlot}
              className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
            >
              <X className="h-3.5 w-3.5" /> Position leeren
            </button>
          )}
          {availableRoster.map((p) => {
            const isAssigned = assignedIds.has(p.id);
            return (
              <button
                key={p.id}
                disabled={!selected}
                onClick={() => assignPlayer(p.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  isAssigned ? "border-wacker-red/30 bg-wacker-red/[0.08]" : "border-white/10 bg-white/[0.02]",
                  selected && !isAssigned && "hover:border-wacker-red/40 hover:bg-white/[0.06]",
                  !selected && "opacity-70"
                )}
              >
                <Avatar name={p.gamerTag} src={p.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{p.gamerTag}</p>
                  <p className="text-[11px] text-ink-400">
                    {p.primaryPosition ? POSITION_LABELS[p.primaryPosition as Position] : "—"}
                  </p>
                </div>
                <AvailabilityBadge status={p.availabilityStatus} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  POSITIONS,
  POSITION_LABELS,
  Position,
  PLAYER_STATUS,
  PLAYER_STATUS_LABELS,
  PlayerStatus,
  SQUAD_ROLES,
  SQUAD_ROLE_LABELS,
  SquadRole,
} from "@/lib/constants";
import { CheckCircle2, Loader2 } from "lucide-react";

type Player = {
  id: string;
  gamerTag: string;
  realName: string | null;
  bio: string | null;
  discordTag: string | null;
  discordUserId?: string | null;
  avatarUrl: string | null;
  primaryPosition: string | null;
  secondaryPosition: string | null;
  squadRole: string;
  status: string;
  jerseyNumber: number | null;
};

export function PlayerEditForm({ player, isManager }: { player: Player; isManager: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({
    gamerTag: player.gamerTag,
    realName: player.realName ?? "",
    bio: player.bio ?? "",
    discordTag: player.discordTag ?? "",
    discordUserId: player.discordUserId ?? "",
    avatarUrl: player.avatarUrl ?? "",
    secondaryPosition: player.secondaryPosition ?? "",
    status: player.status,
    primaryPosition: player.primaryPosition ?? "",
    squadRole: player.squadRole,
    jerseyNumber: player.jerseyNumber?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setSaved(false);

    const payload: any = {
      gamerTag: form.gamerTag,
      realName: form.realName || null,
      bio: form.bio || null,
      discordTag: form.discordTag || null,
      avatarUrl: form.avatarUrl || null,
      discordUserId: form.discordUserId.trim() || null,
      secondaryPosition: form.secondaryPosition || null,
      status: form.status,
    };
    if (isManager) {
      payload.primaryPosition = form.primaryPosition || null;
      payload.squadRole = form.squadRole;
      payload.jerseyNumber = form.jerseyNumber ? parseInt(form.jerseyNumber, 10) : null;
    }

    const res = await fetch(`/api/players/${player.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Speichern fehlgeschlagen.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Gamertag</label>
        <input className="input" value={form.gamerTag} onChange={(e) => setForm({ ...form, gamerTag: e.target.value })} />
      </div>
      <div>
        <label className="label">Echter Name (optional)</label>
        <input className="input" value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} />
      </div>
      <div>
        <label className="label">Discord-Tag (Anzeige)</label>
        <input className="input" value={form.discordTag} onChange={(e) => setForm({ ...form, discordTag: e.target.value })} placeholder="name oder name#0001" />
      </div>
      <div>
        <label className="label">Discord-User-ID (für Zu-/Absage-Buttons)</label>
        <input
          className="input"
          value={form.discordUserId}
          onChange={(e) => setForm({ ...form, discordUserId: e.target.value })}
          placeholder="z.B. 372844837203099648"
          inputMode="numeric"
        />
        <p className="mt-1 text-[11px] text-ink-500">
          In Discord: Einstellungen → Erweitert → Entwicklermodus aktivieren, dann Rechtsklick auf dein Profil → „ID
          kopieren". Nötig, damit Zusage/Absage-Buttons in Discord dich erkennen.
        </p>
      </div>
      <div>
        <label className="label">Profilbild-URL</label>
        <input className="input" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." />
      </div>
      <div>
        <label className="label">Bevorzugte Nebenposition</label>
        <select className="select" value={form.secondaryPosition} onChange={(e) => setForm({ ...form, secondaryPosition: e.target.value })}>
          <option value="">Keine</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {POSITION_LABELS[p]} ({p})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Verfügbarkeitsstatus</label>
        <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {PLAYER_STATUS.map((s) => (
            <option key={s} value={s}>
              {PLAYER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {isManager && (
        <>
          <div>
            <label className="label">Hauptposition</label>
            <select className="select" value={form.primaryPosition} onChange={(e) => setForm({ ...form, primaryPosition: e.target.value })}>
              <option value="">—</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {POSITION_LABELS[p]} ({p})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Teamrolle</label>
            <select className="select" value={form.squadRole} onChange={(e) => setForm({ ...form, squadRole: e.target.value })}>
              {SQUAD_ROLES.map((r) => (
                <option key={r} value={r}>
                  {SQUAD_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Trikotnummer</label>
            <input
              type="number"
              min={0}
              max={99}
              className="input"
              value={form.jerseyNumber}
              onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
            />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label className="label">Bio</label>
        <textarea
          className="input min-h-[90px] resize-y"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          maxLength={1000}
        />
      </div>

      {err && <p className="text-sm text-rose-400 sm:col-span-2">{err}</p>}

      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Änderungen speichern
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Gespeichert
          </span>
        )}
      </div>
    </form>
  );
}

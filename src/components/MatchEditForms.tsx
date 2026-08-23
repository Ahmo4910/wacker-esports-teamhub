"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Megaphone, MessageCircle, Trophy } from "lucide-react";
import { MATCH_STATUS, MATCH_STATUS_LABELS, MatchStatus } from "@/lib/constants";

export function DiscordAnnounceButton({
  matchId,
  alreadyAnnounced,
}: {
  matchId: string;
  alreadyAnnounced: boolean;
}) {
  const router = useRouter();
  const [posting, setPosting] = useState(false);
  const [announced, setAnnounced] = useState(alreadyAnnounced);
  const [error, setError] = useState<string | null>(null);

  async function announce() {
    setPosting(true);
    setError(null);
    const res = await fetch(`/api/matches/${matchId}/discord-announce`, { method: "POST" });
    setPosting(false);
    if (res.ok) {
      setAnnounced(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "In Discord ankündigen fehlgeschlagen.");
    }
  }

  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5" /> Discord
      </label>
      <button onClick={announce} disabled={posting} className="btn-secondary btn-sm">
        {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
        {announced ? "Erneut in Discord ankündigen" : "In Discord ankündigen"}
      </button>
      {announced && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Mit Zusage-/Absage-Buttons gepostet
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export function ResultForm({
  matchId,
  initialOwn,
  initialOpp,
}: {
  matchId: string;
  initialOwn: number | null;
  initialOpp: number | null;
}) {
  const router = useRouter();
  const [own, setOwn] = useState(initialOwn?.toString() ?? "");
  const [opp, setOpp] = useState(initialOpp?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resultOwnScore: own === "" ? null : parseInt(own, 10),
        resultOpponentScore: opp === "" ? null : parseInt(opp, 10),
        status: "PLAYED",
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">Eigenes Ergebnis</label>
        <input type="number" min={0} className="input w-20" value={own} onChange={(e) => setOwn(e.target.value)} />
      </div>
      <span className="pb-2.5 font-display text-xl font-bold text-ink-400">:</span>
      <div>
        <label className="label">Gegner</label>
        <input type="number" min={0} className="input w-20" value={opp} onChange={(e) => setOpp(e.target.value)} />
      </div>
      <button onClick={save} disabled={saving || own === "" || opp === ""} className="btn-primary">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
        Ergebnis speichern
      </button>
      {saved && (
        <span className="flex items-center gap-1.5 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> Gespeichert
        </span>
      )}
    </div>
  );
}

export function MatchStatusForm({ matchId, initialStatus }: { matchId: string; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  async function save(newStatus: string) {
    setStatus(newStatus);
    setSaving(true);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <label className="label">Status</label>
      <select
        className="select"
        value={status}
        disabled={saving}
        onChange={(e) => save(e.target.value)}
      >
        {MATCH_STATUS.map((s) => (
          <option key={s} value={s}>
            {MATCH_STATUS_LABELS[s as MatchStatus]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MatchNotesForm({ matchId, initialNotes }: { matchId: string; initialNotes: string | null }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <Megaphone className="h-3.5 w-3.5" /> Notizen zum Spieltag
      </label>
      <textarea
        className="input min-h-[90px] resize-y"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Interne Notizen für Team, z.B. Treffpunkt im Discord, Serverwahl, Besonderheiten ..."
      />
      <div className="mt-2 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-secondary btn-sm">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Notizen speichern
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Gespeichert
          </span>
        )}
      </div>
    </div>
  );
}

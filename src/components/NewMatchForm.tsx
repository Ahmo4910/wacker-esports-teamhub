"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOME_AWAY, HOME_AWAY_LABELS } from "@/lib/constants";
import { CalendarPlus, Loader2 } from "lucide-react";

type Competition = { id: string; name: string; season: string | null };

export function NewMatchForm({ competitions }: { competitions: Competition[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    opponent: "",
    date: "",
    time: "19:00",
    competitionId: competitions[0]?.id ?? "",
    newCompetitionName: "",
    matchdayLabel: "",
    homeAway: "HOME",
    streamUrl: "",
    notes: "",
  });
  const [useNewCompetition, setUseNewCompetition] = useState(competitions.length === 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const isoDate = form.date && form.time ? `${form.date}T${form.time}:00` : "";

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opponent: form.opponent,
        date: isoDate,
        competitionId: useNewCompetition ? null : form.competitionId || null,
        newCompetitionName: useNewCompetition ? form.newCompetitionName : null,
        matchdayLabel: form.matchdayLabel || null,
        homeAway: form.homeAway,
        streamUrl: form.streamUrl || null,
        notes: form.notes || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/spielplan/${data.match.id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Anlegen fehlgeschlagen.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label">Gegner</label>
        <input required className="input" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} placeholder="z.B. FC Musterstadt eSports" />
      </div>
      <div>
        <label className="label">Datum</label>
        <input required type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </div>
      <div>
        <label className="label">Uhrzeit</label>
        <input required type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>

      <div className="sm:col-span-2">
        <label className="label">Wettbewerb / Liga</label>
        {!useNewCompetition && competitions.length > 0 ? (
          <div className="flex gap-2">
            <select className="select" value={form.competitionId} onChange={(e) => setForm({ ...form, competitionId: e.target.value })}>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.season ? `(${c.season})` : ""}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setUseNewCompetition(true)} className="btn-secondary btn-sm whitespace-nowrap">
              Neu
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Name des Wettbewerbs, z.B. Virtuelle Bundesliga"
              value={form.newCompetitionName}
              onChange={(e) => setForm({ ...form, newCompetitionName: e.target.value })}
            />
            {competitions.length > 0 && (
              <button type="button" onClick={() => setUseNewCompetition(false)} className="btn-secondary btn-sm whitespace-nowrap">
                Auswählen
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="label">Spieltag / Runde (optional)</label>
        <input className="input" value={form.matchdayLabel} onChange={(e) => setForm({ ...form, matchdayLabel: e.target.value })} placeholder="z.B. Spieltag 8" />
      </div>
      <div>
        <label className="label">Heim/Auswärts</label>
        <select className="select" value={form.homeAway} onChange={(e) => setForm({ ...form, homeAway: e.target.value })}>
          {HOME_AWAY.map((h) => (
            <option key={h} value={h}>
              {HOME_AWAY_LABELS[h]}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="label">Stream-Link (optional)</label>
        <input className="input" value={form.streamUrl} onChange={(e) => setForm({ ...form, streamUrl: e.target.value })} placeholder="https://twitch.tv/..." />
      </div>

      <div className="sm:col-span-2">
        <label className="label">Notizen (optional)</label>
        <textarea className="input min-h-[80px] resize-y" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      {error && <p className="text-sm text-rose-400 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
          Spieltag anlegen
        </button>
      </div>
    </form>
  );
}

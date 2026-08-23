"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Dumbbell } from "lucide-react";

export function NewTrainingForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/trainings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, location: location || undefined, notes: notes || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/training");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Training konnte nicht angelegt werden.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="date">
          Datum & Uhrzeit
        </label>
        <input
          id="date"
          type="datetime-local"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="location">
          Ort (optional)
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="z.B. Discord Voice, TeamSpeak, vor Ort ..."
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notizen (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="z.B. Trainingsschwerpunkt, besondere Hinweise ..."
          className="input resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dumbbell className="h-4 w-4" />}
        Training anlegen
      </button>
    </form>
  );
}

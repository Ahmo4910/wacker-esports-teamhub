"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FORMATIONS,
  Formation,
  TACTIC_STYLE,
  TACTIC_STYLE_LABELS,
  TacticStyle,
  TACTIC_PRESSING,
  TACTIC_PRESSING_LABELS,
  TacticPressing,
  TACTIC_TEMPO,
  TACTIC_TEMPO_LABELS,
  TacticTempo,
} from "@/lib/constants";
import { CheckCircle2, Gauge, Loader2, Save, Shield, Swords, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function TacticEditor({
  matchId,
  initial,
}: {
  matchId: string;
  initial: {
    formation: Formation;
    style: TacticStyle;
    pressing: TacticPressing;
    tempo: TacticTempo;
    instructions: string | null;
  };
}) {
  const router = useRouter();
  const [formation, setFormation] = useState<Formation>(initial.formation);
  const [style, setStyle] = useState<TacticStyle>(initial.style);
  const [pressing, setPressing] = useState<TacticPressing>(initial.pressing);
  const [tempo, setTempo] = useState<TacticTempo>(initial.tempo);
  const [instructions, setInstructions] = useState(initial.instructions ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/matches/${matchId}/tactic`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formation, style, pressing, tempo, instructions }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Speichern fehlgeschlagen.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Formation</label>
          <select className="select" value={formation} onChange={(e) => setFormation(e.target.value as Formation)}>
            {FORMATIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <OptionGroup
          icon={Swords}
          label="Spielweise"
          value={style}
          onChange={(v) => setStyle(v as TacticStyle)}
          options={TACTIC_STYLE}
          labels={TACTIC_STYLE_LABELS}
        />
        <OptionGroup
          icon={Shield}
          label="Pressing"
          value={pressing}
          onChange={(v) => setPressing(v as TacticPressing)}
          options={TACTIC_PRESSING}
          labels={TACTIC_PRESSING_LABELS}
        />
        <OptionGroup
          icon={Zap}
          label="Spieltempo"
          value={tempo}
          onChange={(v) => setTempo(v as TacticTempo)}
          options={TACTIC_TEMPO}
          labels={TACTIC_TEMPO_LABELS}
        />
      </div>

      <div>
        <label className="label flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5" /> Taktische Anweisungen
        </label>
        <textarea
          className="input min-h-[160px] resize-y"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Individuelle Anweisungen für dieses Spiel: Pressingauslöser, Standardsituationen, Gegner-Schwächen, Rollenverteilung ..."
          maxLength={3000}
        />
        <p className="mt-1 text-right text-[11px] text-ink-500">{instructions.length}/3000</p>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Taktik speichern
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Gespeichert & Team benachrichtigt
          </span>
        )}
      </div>
    </div>
  );
}

function OptionGroup<T extends string>({
  icon: Icon,
  label,
  value,
  onChange,
  options,
  labels,
}: {
  icon: any;
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  labels: Record<T, string>;
}) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </label>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              value === opt
                ? "border-wacker-red bg-wacker-red/15 text-white"
                : "border-white/10 bg-white/[0.02] text-ink-300 hover:bg-white/[0.06]"
            )}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

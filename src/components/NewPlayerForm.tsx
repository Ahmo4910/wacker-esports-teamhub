"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  POSITIONS,
  POSITION_LABELS,
  SQUAD_ROLES,
  SQUAD_ROLE_LABELS,
  SYSTEM_ROLES,
  SYSTEM_ROLE_LABELS,
} from "@/lib/constants";
import { Loader2, UserPlus } from "lucide-react";

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function NewPlayerForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: randomPassword(),
    gamerTag: "",
    realName: "",
    primaryPosition: "ST",
    squadRole: "STAMMSPIELER",
    systemRole: "PLAYER",
    jerseyNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInfo, setCreatedInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        realName: form.realName || null,
        jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber, 10) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setCreatedInfo(`${form.gamerTag} wurde angelegt. Zugangsdaten: ${form.email} / ${form.password}`);
      setTimeout(() => router.push("/admin/spieler"), 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Anlegen fehlgeschlagen.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Name</label>
        <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="label">Gamertag</label>
        <input required className="input" value={form.gamerTag} onChange={(e) => setForm({ ...form, gamerTag: e.target.value })} />
      </div>
      <div>
        <label className="label">E-Mail (Login)</label>
        <input
          required
          type="email"
          className="input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="name@wacker-esports.de"
        />
      </div>
      <div>
        <label className="label">Initiales Passwort</label>
        <div className="flex gap-2">
          <input required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" onClick={() => setForm({ ...form, password: randomPassword() })} className="btn-secondary btn-sm whitespace-nowrap">
            Neu generieren
          </button>
        </div>
      </div>
      <div>
        <label className="label">Echter Name (optional)</label>
        <input className="input" value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} />
      </div>
      <div>
        <label className="label">Trikotnummer</label>
        <input type="number" min={0} max={99} className="input" value={form.jerseyNumber} onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })} />
      </div>
      <div>
        <label className="label">Hauptposition</label>
        <select className="select" value={form.primaryPosition} onChange={(e) => setForm({ ...form, primaryPosition: e.target.value })}>
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
      <div className="sm:col-span-2">
        <label className="label">System-Rolle (Zugriffsrechte)</label>
        <select className="select" value={form.systemRole} onChange={(e) => setForm({ ...form, systemRole: e.target.value })}>
          {SYSTEM_ROLES.map((r) => (
            <option key={r} value={r}>
              {SYSTEM_ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-rose-400 sm:col-span-2">{error}</p>}
      {createdInfo && <p className="text-sm text-emerald-400 sm:col-span-2">{createdInfo}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Spieler anlegen
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setTimeout(() => setSaved(false), 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Passwort konnte nicht geändert werden.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="label">Aktuelles Passwort</label>
        <input
          type="password"
          required
          className="input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Neues Passwort</label>
          <input
            type="password"
            required
            minLength={8}
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Neues Passwort bestätigen</label>
          <input
            type="password"
            required
            minLength={8}
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          Passwort ändern
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Passwort geändert
          </span>
        )}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/Avatar";
import { SYSTEM_ROLES, SYSTEM_ROLE_LABELS, SystemRole } from "@/lib/constants";
import { Check, KeyRound, Loader2, Trash2, X } from "lucide-react";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  player: { gamerTag: string; avatarUrl: string | null } | null;
};

export function AdminUserTable({ users }: { users: Row[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function updateRole(id: string, role: string) {
    setBusyId(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    setBusyId(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function submitReset(id: string) {
    if (newPassword.length < 8) return;
    setBusyId(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    setBusyId(null);
    setResetId(null);
    setNewPassword("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusyId(null);
    setConfirmDeleteId(null);
    router.refresh();
  }

  return (
    <div className="card overflow-x-auto">
      <table className="table-modern">
        <thead>
          <tr>
            <th>Benutzer</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Status</th>
            <th className="text-right">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isMe = u.id === session?.user?.id;
            return (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} src={u.player?.avatarUrl} size="sm" />
                    <div>
                      <p className="font-medium text-white">
                        {u.name} {isMe && <span className="text-xs text-ink-500">(du)</span>}
                      </p>
                      {u.player && <p className="text-xs text-ink-400">{u.player.gamerTag}</p>}
                    </div>
                  </div>
                </td>
                <td className="text-ink-300">{u.email}</td>
                <td>
                  <select
                    className="select w-auto py-1.5 text-xs"
                    value={u.role}
                    disabled={busyId === u.id || isMe}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    {SYSTEM_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {SYSTEM_ROLE_LABELS[r as SystemRole]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => toggleActive(u.id, !u.active)}
                    disabled={busyId === u.id || isMe}
                    className={u.active ? "badge bg-emerald-500/15 text-emerald-400" : "badge bg-ink-600 text-ink-300"}
                  >
                    {u.active ? "Aktiv" : "Inaktiv"}
                  </button>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {resetId === u.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Neues Passwort"
                          className="input w-36 py-1.5 text-xs"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button onClick={() => submitReset(u.id)} className="btn-secondary btn-sm" disabled={busyId === u.id}>
                          {busyId === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setResetId(null)} className="btn-ghost btn-sm">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setResetId(u.id)} className="btn-ghost btn-sm" title="Passwort zurücksetzen">
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {!isMe &&
                      (confirmDeleteId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleDelete(u.id)} className="btn-danger btn-sm">
                            Bestätigen
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="btn-ghost btn-sm">
                            Abbrechen
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(u.id)} className="btn-ghost btn-sm text-rose-400" title="Konto löschen">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

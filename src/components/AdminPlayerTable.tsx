"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { SquadRoleBadge, PlayerStatusBadge } from "@/components/Badges";
import { SYSTEM_ROLE_LABELS, SystemRole } from "@/lib/constants";
import { Loader2, Pencil, Trash2 } from "lucide-react";

type Row = {
  id: string;
  gamerTag: string;
  realName: string | null;
  avatarUrl: string | null;
  squadRole: string;
  status: string;
  jerseyNumber: number | null;
  user: { id: string; email: string; role: string; active: boolean };
};

export function AdminPlayerTable({ players }: { players: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
    setBusyId(null);
    setConfirmId(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="card overflow-x-auto">
      <table className="table-modern">
        <thead>
          <tr>
            <th>Spieler</th>
            <th>E-Mail</th>
            <th>System-Rolle</th>
            <th>Teamrolle</th>
            <th>Status</th>
            <th>Konto</th>
            <th className="text-right">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="flex items-center gap-3">
                  <Avatar name={p.gamerTag} src={p.avatarUrl} size="sm" />
                  <div>
                    <p className="font-medium text-white">{p.gamerTag}</p>
                    {p.realName && <p className="text-xs text-ink-400">{p.realName}</p>}
                  </div>
                </div>
              </td>
              <td className="text-ink-300">{p.user.email}</td>
              <td className="text-ink-300">{SYSTEM_ROLE_LABELS[p.user.role as SystemRole]}</td>
              <td>
                <SquadRoleBadge role={p.squadRole} />
              </td>
              <td>
                <PlayerStatusBadge status={p.status} />
              </td>
              <td>
                <span className={p.user.active ? "badge bg-emerald-500/15 text-emerald-400" : "badge bg-ink-600 text-ink-300"}>
                  {p.user.active ? "Aktiv" : "Inaktiv"}
                </span>
              </td>
              <td>
                <div className="flex justify-end gap-2">
                  <Link href={`/kader/${p.id}`} className="btn-ghost btn-sm" title="Bearbeiten">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  {confirmId === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={busyId === p.id}
                        className="btn-danger btn-sm"
                      >
                        {busyId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Bestätigen"}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="btn-ghost btn-sm">
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(p.id)} className="btn-ghost btn-sm text-rose-400" title="Entfernen">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

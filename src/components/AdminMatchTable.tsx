"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MatchStatusBadge, OutcomeBadge } from "@/components/Badges";
import { formatDateTime, matchOutcome } from "@/lib/utils";
import { Loader2, Pencil, Trash2 } from "lucide-react";

type Row = {
  id: string;
  opponent: string;
  date: string;
  status: string;
  resultOwnScore: number | null;
  resultOpponentScore: number | null;
  competition: { name: string } | null;
};

export function AdminMatchTable({ matches }: { matches: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
    setBusyId(null);
    setConfirmId(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="card overflow-x-auto">
      <table className="table-modern">
        <thead>
          <tr>
            <th>Gegner</th>
            <th>Wettbewerb</th>
            <th>Termin</th>
            <th>Status</th>
            <th>Ergebnis</th>
            <th className="text-right">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id}>
              <td className="font-medium text-white">{m.opponent}</td>
              <td className="text-ink-300">{m.competition?.name ?? "—"}</td>
              <td className="text-ink-300">{formatDateTime(m.date)}</td>
              <td>
                <MatchStatusBadge status={m.status} />
              </td>
              <td>
                {m.resultOwnScore != null ? (
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {m.resultOwnScore}:{m.resultOpponentScore}
                    </span>
                    <OutcomeBadge outcome={matchOutcome(m.resultOwnScore, m.resultOpponentScore)} />
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td>
                <div className="flex justify-end gap-2">
                  <Link href={`/spielplan/${m.id}`} className="btn-ghost btn-sm" title="Bearbeiten">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  {confirmId === m.id ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleDelete(m.id)} disabled={busyId === m.id} className="btn-danger btn-sm">
                        {busyId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Bestätigen"}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="btn-ghost btn-sm">
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(m.id)} className="btn-ghost btn-sm text-rose-400" title="Löschen">
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

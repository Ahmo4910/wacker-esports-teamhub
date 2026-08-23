"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PlayerCard } from "@/components/PlayerCard";
import { SquadRoleBadge, PlayerStatusBadge } from "@/components/Badges";
import { POSITION_LABELS, Position, SQUAD_ROLE_LABELS, SquadRole } from "@/lib/constants";
import { LayoutGrid, List, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type PlayerRow = {
  id: string;
  gamerTag: string;
  realName: string | null;
  avatarUrl: string | null;
  primaryPosition: string | null;
  squadRole: string;
  status: string;
  jerseyNumber: number | null;
};

export function KaderView({ players }: { players: PlayerRow[] }) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchesQuery =
        query.trim() === "" ||
        p.gamerTag.toLowerCase().includes(query.toLowerCase()) ||
        (p.realName ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "ALL" || p.squadRole === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [players, query, roleFilter]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spieler suchen ..."
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="select w-auto">
            <option value="ALL">Alle Rollen</option>
            {Object.entries(SQUAD_ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setView("grid")}
              className={cn("rounded-lg p-2 transition-colors", view === "grid" ? "bg-wacker-red text-white" : "text-ink-400 hover:text-white")}
              aria-label="Kartenansicht"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn("rounded-lg p-2 transition-colors", view === "table" ? "bg-wacker-red text-white" : "text-ink-400 hover:text-white")}
              aria-label="Tabellenansicht"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-14 text-center text-ink-400">Keine Spieler gefunden.</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Spieler</th>
                <th>Position</th>
                <th>Teamrolle</th>
                <th>Status</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/kader/${p.id}`} className="flex items-center gap-3">
                      <Avatar name={p.gamerTag} src={p.avatarUrl} size="sm" />
                      <div>
                        <p className="font-medium text-white">{p.gamerTag}</p>
                        {p.realName && <p className="text-xs text-ink-400">{p.realName}</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="text-ink-300">
                    {p.primaryPosition ? `${POSITION_LABELS[p.primaryPosition as Position]} (${p.primaryPosition})` : "—"}
                  </td>
                  <td>
                    <SquadRoleBadge role={p.squadRole} />
                  </td>
                  <td>
                    <PlayerStatusBadge status={p.status} />
                  </td>
                  <td className="text-ink-300">{p.jerseyNumber ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

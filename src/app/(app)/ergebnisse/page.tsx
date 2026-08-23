import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { MatchCard } from "@/components/MatchCard";
import { matchOutcome } from "@/lib/utils";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default async function ErgebnissePage() {
  const played = await prisma.match.findMany({
    where: { status: "PLAYED" },
    orderBy: { date: "desc" },
    include: { competition: true },
  });

  let wins = 0,
    draws = 0,
    losses = 0,
    goalsFor = 0,
    goalsAgainst = 0;
  for (const m of played) {
    const o = matchOutcome(m.resultOwnScore, m.resultOpponentScore);
    if (o === "WIN") wins++;
    else if (o === "DRAW") draws++;
    else if (o === "LOSS") losses++;
    goalsFor += m.resultOwnScore ?? 0;
    goalsAgainst += m.resultOpponentScore ?? 0;
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Ergebnisse" subtitle="Bilanz und Spielverläufe der laufenden Saison" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard icon={Trophy} label="Spiele" value={played.length} />
        <StatCard icon={TrendingUp} label="Siege" value={wins} accent="text-emerald-400" />
        <StatCard icon={Minus} label="Unentschieden" value={draws} accent="text-amber-400" />
        <StatCard icon={TrendingDown} label="Niederlagen" value={losses} accent="text-rose-400" />
        <StatCard icon={Trophy} label="Tore" value={`${goalsFor}:${goalsAgainst}`} />
      </div>

      {played.length === 0 ? (
        <EmptyState title="Noch keine Ergebnisse erfasst" subtitle="Nach dem ersten gespielten Spiel erscheinen hier die Ergebnisse." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {played.map((m) => (
            <MatchCard key={m.id} match={m} href={`/spielplan/${m.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: string }) {
  return (
    <div className="card flex flex-col items-center gap-1 p-4 text-center">
      <Icon className={`h-4 w-4 ${accent ?? "text-ink-400"}`} />
      <p className={`font-display text-xl font-bold ${accent ?? "text-white"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

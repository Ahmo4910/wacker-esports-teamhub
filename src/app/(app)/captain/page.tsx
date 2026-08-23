import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { MatchStatusBadge } from "@/components/Badges";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Shirt, Target, UserX, Users2, ChevronRight, ClipboardList } from "lucide-react";

export default async function CaptainPage() {
  const matches = await prisma.match.findMany({
    where: { status: { in: ["SCHEDULED", "LINEUP_OPEN", "LINEUP_PUBLISHED"] } },
    orderBy: { date: "asc" },
    take: 5,
    include: {
      competition: true,
      availabilities: { include: { player: true } },
      lineup: { select: { published: true } },
      tactic: { select: { id: true } },
    },
  });

  const totalPlayers = await prisma.player.count({ where: { squadRole: { not: "COACH" } } });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Captain-Bereich"
        subtitle="Deine Kommandozentrale für Aufstellung, Taktik und Spieltag-Organisation"
      />

      {matches.length === 0 ? (
        <EmptyState title="Aktuell keine offenen Spieltage" />
      ) : (
        <div className="space-y-4">
          {matches.map((m) => {
            const accepted = m.availabilities.filter((a) => a.status === "ACCEPTED");
            const declined = m.availabilities.filter((a) => a.status === "DECLINED");
            const pending = totalPlayers - accepted.length - declined.length;
            const lineupDone = m.lineup?.published;

            return (
              <div key={m.id} className="card p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <MatchStatusBadge status={m.status} />
                      <span className="text-xs text-ink-400">
                        {m.competition?.name ?? "Freundschaftsspiel"}
                        {m.matchdayLabel ? ` · ${m.matchdayLabel}` : ""}
                      </span>
                    </div>
                    <p className="font-display text-xl font-bold text-white">vs. {m.opponent}</p>
                    <p className="text-sm text-ink-300">{formatDateTime(m.date)}</p>
                  </div>
                  <Link href={`/spielplan/${m.id}`} className="btn-ghost btn-sm">
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-3">
                  <MiniStat icon={Users2} label="Zugesagt" value={accepted.length} accent="text-emerald-400" />
                  <MiniStat icon={UserX} label="Abgesagt" value={declined.length} accent="text-rose-400" />
                  <MiniStat icon={ClipboardList} label="Offen" value={Math.max(pending, 0)} accent="text-ink-300" />
                </div>

                {declined.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {declined.map((d) => (
                      <span key={d.id} className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-2.5 py-1 text-xs text-rose-300">
                        {d.player.gamerTag} {d.reason ? `· ${d.reason}` : ""}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link href={`/aufstellung/${m.id}`} className={lineupDone ? "btn-secondary btn-sm" : "btn-primary btn-sm"}>
                    <Shirt className="h-3.5 w-3.5" />
                    {lineupDone ? "Aufstellung bearbeiten" : "Aufstellung festlegen"}
                  </Link>
                  <Link href={`/taktik/${m.id}`} className="btn-secondary btn-sm">
                    <Target className="h-3.5 w-3.5" /> Taktik festlegen
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <Icon className={`h-4 w-4 ${accent}`} />
      <div>
        <p className={`font-display text-base font-bold leading-none ${accent}`}>{value}</p>
        <p className="text-[10px] text-ink-400">{label}</p>
      </div>
    </div>
  );
}

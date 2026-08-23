import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { MatchStatusBadge, AvailabilityBadge } from "@/components/Badges";
import { formatDateTime } from "@/lib/utils";
import { HOME_AWAY_LABELS } from "@/lib/constants";
import Link from "next/link";
import { CalendarPlus, ChevronRight, Shirt, Target, Users2 } from "lucide-react";

export default async function SpieltageManagementPage() {
  const session = await getServerSession(authOptions);
  const isLead = session!.user.role === "CAPTAIN" || session!.user.role === "MANAGER";

  const matches = await prisma.match.findMany({
    where: { status: { not: "PLAYED" } },
    orderBy: { date: "asc" },
    include: {
      competition: true,
      availabilities: true,
      lineup: { select: { published: true } },
      tactic: { select: { id: true } },
    },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Spieltag-Verwaltung"
        subtitle="Alle offenen Spieltage im Überblick — Zu-/Absagen, Aufstellung und Taktik auf einen Blick."
        actions={
          session?.user.role === "MANAGER" ? (
            <Link href="/admin/spieltage/neu" className="btn-primary">
              <CalendarPlus className="h-4 w-4" /> Spieltag erstellen
            </Link>
          ) : undefined
        }
      />

      {matches.length === 0 ? (
        <EmptyState title="Keine offenen Spieltage" subtitle="Aktuell ist kein Spieltag geplant." />
      ) : (
        <div className="space-y-4">
          {matches.map((m) => {
            const accepted = m.availabilities.filter((a) => a.status === "ACCEPTED").length;
            const declined = m.availabilities.filter((a) => a.status === "DECLINED").length;
            const pending = m.availabilities.filter((a) => a.status === "PENDING").length;
            return (
              <div key={m.id} className="card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <MatchStatusBadge status={m.status} />
                      <span className="text-xs text-ink-400">
                        {m.competition?.name ?? "Freundschaftsspiel"}
                        {m.matchdayLabel ? ` · ${m.matchdayLabel}` : ""}
                      </span>
                    </div>
                    <p className="font-display text-xl font-bold text-white">vs. {m.opponent}</p>
                    <p className="text-sm text-ink-300">
                      {formatDateTime(m.date)} · {HOME_AWAY_LABELS[m.homeAway as "HOME" | "AWAY"]}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Users2 className="h-3.5 w-3.5" /> {accepted}
                      </span>
                      <span className="text-rose-400">{declined} Absagen</span>
                      <span className="text-ink-400">{pending} offen</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/spielplan/${m.id}`} className="btn-secondary btn-sm">
                        Details <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      {isLead && (
                        <>
                          <Link href={`/aufstellung/${m.id}`} className="btn-ghost btn-sm" title="Aufstellung verwalten">
                            <Shirt className="h-3.5 w-3.5" />
                          </Link>
                          <Link href={`/taktik/${m.id}`} className="btn-ghost btn-sm" title="Taktik verwalten">
                            <Target className="h-3.5 w-3.5" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {m.lineup && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
                    <span className={m.lineup.published ? "text-emerald-400" : "text-amber-400"}>
                      {m.lineup.published ? "● Aufstellung veröffentlicht" : "● Aufstellung im Entwurf"}
                    </span>
                    {m.tactic && <span>· Taktik festgelegt</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

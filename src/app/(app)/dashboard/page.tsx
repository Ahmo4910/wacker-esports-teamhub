import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextMatch, getUpcomingMatches, getRecentResults } from "@/lib/matchQueries";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { MatchCard } from "@/components/MatchCard";
import { MatchStatusBadge, AvailabilityBadge } from "@/components/Badges";
import { RsvpButtons } from "@/components/RsvpButtons";
import { formatDateTime, relativeDay, matchOutcome } from "@/lib/utils";
import { HOME_AWAY_LABELS, PLAYER_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";
import { Users, UserCheck, UserX, ArrowRight, MapPin, Trophy, Shirt } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const playerId = session!.user.playerId;

  const [nextMatch, upcoming, recent, totalPlayers, available, unavailable] = await Promise.all([
    getNextMatch(),
    getUpcomingMatches(4),
    getRecentResults(4),
    prisma.player.count(),
    prisma.player.count({ where: { status: "AVAILABLE" } }),
    prisma.player.count({ where: { status: { in: ["UNAVAILABLE", "INJURED"] } } }),
  ]);

  const myAvailability = nextMatch?.availabilities.find((a) => a.playerId === playerId);
  const myLineupSlot = nextMatch?.lineup?.slots.find((s) => s.playerId === playerId);

  const acceptedCount = nextMatch?.availabilities.filter((a) => a.status === "ACCEPTED").length ?? 0;
  const declinedCount = nextMatch?.availabilities.filter((a) => a.status === "DECLINED").length ?? 0;
  const pendingCount = Math.max(totalPlayers - acceptedCount - declinedCount, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`Willkommen zurück, ${session!.user.name.split(" ")[0]}`}
        subtitle="Hier ist der aktuelle Stand rund um SV Wacker Burghausen eSports."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Nächstes Spiel */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Nächstes Spiel</h2>
            {nextMatch && <MatchStatusBadge status={nextMatch.status} />}
          </div>

          {!nextMatch ? (
            <EmptyState title="Kein anstehendes Spiel geplant" subtitle="Der Manager kann im Admin-Bereich einen neuen Spieltag anlegen." />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-ink-300">
                    <Trophy className="h-3.5 w-3.5" />
                    {nextMatch.competition?.name ?? "Freundschaftsspiel"}
                    {nextMatch.matchdayLabel ? ` · ${nextMatch.matchdayLabel}` : ""}
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-white">vs. {nextMatch.opponent}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {HOME_AWAY_LABELS[nextMatch.homeAway as "HOME" | "AWAY"]}
                    </span>
                    <span>{relativeDay(nextMatch.date)} · {formatDateTime(nextMatch.date)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <Link href={`/spielplan/${nextMatch.id}`} className="btn-secondary btn-sm">
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/aufstellung/${nextMatch.id}`} className="btn-ghost btn-sm">
                    <Shirt className="h-3.5 w-3.5" /> Aufstellung ansehen
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div>
                  <p className="font-display text-xl font-bold text-emerald-400">{acceptedCount}</p>
                  <p className="text-[11px] text-ink-400">Zusagen</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-rose-400">{declinedCount}</p>
                  <p className="text-[11px] text-ink-400">Absagen</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-ink-300">{pendingCount}</p>
                  <p className="text-[11px] text-ink-400">Offen</p>
                </div>
              </div>

              {myLineupSlot && nextMatch.lineup?.published && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  Du stehst in der {myLineupSlot.isStarter ? "Startaufstellung" : "Ersatzbank"} ({myLineupSlot.slotKey}).
                </div>
              )}

              {playerId && (
                <div>
                  <p className="label !mb-2">Deine Zu-/Absage</p>
                  <RsvpButtons
                    matchId={nextMatch.id}
                    initialStatus={(myAvailability?.status as any) ?? "PENDING"}
                    initialReason={myAvailability?.reason}
                    compact
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kader Übersicht */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Kader</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-ink-200">
                <Users className="h-4 w-4 text-ink-400" /> Spieler gesamt
              </span>
              <span className="font-display text-lg font-bold text-white">{totalPlayers}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-emerald-300">
                <UserCheck className="h-4 w-4" /> Verfügbar
              </span>
              <span className="font-display text-lg font-bold text-emerald-400">{available}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-rose-300">
                <UserX className="h-4 w-4" /> Nicht verfügbar
              </span>
              <span className="font-display text-lg font-bold text-rose-400">{unavailable}</span>
            </div>
          </div>
          <Link href="/kader" className="btn-secondary btn-sm mt-4 w-full">
            Zum Kader <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Nächste Spieltage */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Nächste Spieltage</h2>
            <Link href="/spielplan" className="text-xs font-medium text-wacker-red-light hover:text-white">
              Alle anzeigen
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState title="Keine weiteren Spiele geplant" />
          ) : (
            <div className="space-y-3">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} href={`/spielplan/${m.id}`} />
              ))}
            </div>
          )}
        </div>

        {/* Letzte Ergebnisse */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Letzte Ergebnisse</h2>
            <Link href="/ergebnisse" className="text-xs font-medium text-wacker-red-light hover:text-white">
              Alle anzeigen
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="Noch keine Ergebnisse erfasst" />
          ) : (
            <div className="space-y-3">
              {recent.map((m) => (
                <MatchCard key={m.id} match={m} href={`/spielplan/${m.id}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

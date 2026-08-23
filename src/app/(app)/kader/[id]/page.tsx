import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlayerStats } from "@/lib/playerStats";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { SquadRoleBadge, PlayerStatusBadge } from "@/components/Badges";
import { POSITION_LABELS, Position, SYSTEM_ROLE_LABELS, WEEKDAYS } from "@/lib/constants";
import { PlayerEditForm } from "@/components/PlayerEditForm";
import { CalendarClock, Hash, MessageCircle } from "lucide-react";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { user: true, weeklyAvailability: true },
  });
  if (!player) notFound();

  const stats = await getPlayerStats(player.id);
  const isSelf = session!.user.playerId === player.id;
  const isManager = session!.user.role === "MANAGER";
  const canEdit = isSelf || isManager;

  return (
    <div className="animate-fade-up">
      <PageHeader title={player.gamerTag} subtitle={player.realName ?? undefined} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card flex flex-col items-center gap-4 p-6 text-center lg:col-span-1">
          <Avatar name={player.gamerTag} src={player.avatarUrl} size="xl" />
          <div>
            <p className="font-display text-xl font-bold text-white">{player.gamerTag}</p>
            {player.realName && <p className="text-sm text-ink-400">{player.realName}</p>}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <SquadRoleBadge role={player.squadRole} />
            <PlayerStatusBadge status={player.status} />
          </div>
          <div className="grid w-full grid-cols-2 gap-3 text-left text-sm">
            {player.primaryPosition && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-400">Position</p>
                <p className="font-medium text-white">{POSITION_LABELS[player.primaryPosition as Position]}</p>
              </div>
            )}
            {player.jerseyNumber != null && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-400">Trikotnummer</p>
                <p className="flex items-center gap-1 font-medium text-white">
                  <Hash className="h-3.5 w-3.5" /> {player.jerseyNumber}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-wide text-ink-400">System-Rolle</p>
              <p className="font-medium text-white">{SYSTEM_ROLE_LABELS[player.user.role as "PLAYER"]}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-wide text-ink-400">Im Team seit</p>
              <p className="font-medium text-white">
                {new Date(player.joinedAt).toLocaleDateString("de-DE", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          {player.discordTag && (
            <p className="flex items-center gap-1.5 text-sm text-ink-300">
              <MessageCircle className="h-4 w-4" /> {player.discordTag}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          {player.bio && (
            <div className="card p-5">
              <h2 className="section-title mb-2">Über {player.gamerTag}</h2>
              <p className="text-sm leading-relaxed text-ink-200">{player.bio}</p>
            </div>
          )}

          <div className="card p-5">
            <h2 className="section-title mb-4">Saisonstatistik</h2>
            <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
              <Stat label="Einsätze" value={stats.appearances} />
              <Stat label="Startelf" value={stats.starts} />
              <Stat label="Eingewechselt" value={stats.subApps} />
              <Stat label="Siege" value={stats.wins} accent="text-emerald-400" />
              <Stat label="Niederlagen" value={stats.losses} accent="text-rose-400" />
            </div>
          </div>

          {player.weeklyAvailability.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <CalendarClock className="h-5 w-5" /> Wöchentliche Verfügbarkeit
              </h2>
              <div className="space-y-2">
                {player.weeklyAvailability.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-white">{WEEKDAYS[w.weekday]}</span>
                    <span className="text-ink-300">
                      {w.fromTime} – {w.toTime} Uhr
                    </span>
                    {w.note && <span className="text-xs text-ink-400">{w.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {canEdit && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Profil bearbeiten</h2>
              <PlayerEditForm player={player} isManager={isManager} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div>
      <p className={`font-display text-2xl font-bold ${accent ?? "text-white"}`}>{value}</p>
      <p className="text-[11px] text-ink-400">{label}</p>
    </div>
  );
}

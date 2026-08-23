import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { LineupEditor } from "@/components/LineupEditor";
import { Pitch } from "@/components/Pitch";
import { MatchStatusBadge } from "@/components/Badges";
import { Formation } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export default async function AufstellungPage({ params }: { params: { matchId: string } }) {
  const session = await getServerSession(authOptions);
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    include: {
      competition: true,
      lineup: { include: { slots: { include: { player: true } } } },
      availabilities: true,
    },
  });
  if (!match) notFound();

  const isLead = session!.user.role === "CAPTAIN" || session!.user.role === "MANAGER";

  const header = (
    <PageHeader
      title="Aufstellung"
      subtitle={`vs. ${match.opponent} · ${formatDateTime(match.date)}`}
      actions={
        <Link href={`/spielplan/${match.id}`} className="btn-secondary">
          <CalendarDays className="h-4 w-4" /> Spieltag-Details
        </Link>
      }
    />
  );

  if (isLead) {
    const players = await prisma.player.findMany({
      orderBy: { gamerTag: "asc" },
      select: { id: true, gamerTag: true, avatarUrl: true, primaryPosition: true, jerseyNumber: true },
    });
    const availabilityByPlayer = new Map(match.availabilities.map((a) => [a.playerId, a.status]));
    const roster = players.map((p) => ({
      ...p,
      availabilityStatus: (availabilityByPlayer.get(p.id) as "ACCEPTED" | "DECLINED" | "PENDING") ?? "PENDING",
    }));

    const initialSlots =
      match.lineup?.slots.map((s) => ({
        slotKey: s.slotKey,
        isStarter: s.isStarter,
        order: s.order,
        playerId: s.playerId,
      })) ?? [];

    return (
      <div className="animate-fade-up">
        {header}
        <LineupEditor
          matchId={match.id}
          roster={roster}
          initialFormation={(match.lineup?.formation as Formation) ?? "4-3-3"}
          initialSlots={initialSlots}
          initialPublished={match.lineup?.published ?? false}
        />
      </div>
    );
  }

  // Spieler-Ansicht (nur lesend)
  if (!match.lineup || !match.lineup.published) {
    return (
      <div className="animate-fade-up">
        {header}
        <EmptyState
          title="Die Aufstellung wurde noch nicht veröffentlicht"
          subtitle="Der Captain arbeitet aktuell an der Aufstellung für dieses Spiel. Schau später noch einmal vorbei."
        />
      </div>
    );
  }

  const starters = match.lineup.slots.filter((s) => s.isStarter && s.player);
  const bench = match.lineup.slots.filter((s) => !s.isStarter && s.player);
  const assignments: Record<string, any> = {};
  for (const s of starters) assignments[s.slotKey] = s.player;

  return (
    <div className="animate-fade-up">
      {header}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="badge bg-emerald-500/15 text-emerald-400">Veröffentlicht</span>
          <MatchStatusBadge status={match.status} />
        </div>
        <Pitch formation={match.lineup.formation as Formation} assignments={assignments} />
        {bench.length > 0 && (
          <div className="mt-5">
            <p className="label !mb-2">Ersatzspieler</p>
            <div className="flex flex-wrap gap-2">
              {bench.map((s) => (
                <span key={s.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-200">
                  {s.player?.gamerTag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

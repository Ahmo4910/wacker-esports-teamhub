import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { MatchStatusBadge, OutcomeBadge } from "@/components/Badges";
import { AvailabilityTable } from "@/components/AvailabilityTable";
import { RsvpButtons } from "@/components/RsvpButtons";
import { ResultForm, MatchStatusForm, MatchNotesForm, DiscordAnnounceButton } from "@/components/MatchEditForms";
import { Pitch } from "@/components/Pitch";
import { formatDateTime, matchOutcome } from "@/lib/utils";
import {
  HOME_AWAY_LABELS,
  TACTIC_STYLE_LABELS,
  TACTIC_PRESSING_LABELS,
  TACTIC_TEMPO_LABELS,
  Formation,
} from "@/lib/constants";
import Link from "next/link";
import { CalendarDays, MapPin, Radio, Shirt, Target, Trophy } from "lucide-react";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      competition: true,
      availabilities: { include: { player: true } },
      lineup: { include: { slots: { include: { player: true } } } },
      tactic: true,
    },
  });
  if (!match) notFound();

  const role = session!.user.role;
  const isLead = role === "CAPTAIN" || role === "MANAGER";
  const isManager = role === "MANAGER";
  const playerId = session!.user.playerId;
  const myAvailability = match.availabilities.find((a) => a.playerId === playerId);
  const outcome = matchOutcome(match.resultOwnScore, match.resultOpponentScore);

  const starters = match.lineup?.slots.filter((s) => s.isStarter && s.player) ?? [];
  const bench = match.lineup?.slots.filter((s) => !s.isStarter && s.player) ?? [];

  const assignments: Record<string, any> = {};
  for (const s of starters) assignments[s.slotKey] = s.player;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`vs. ${match.opponent}`}
        subtitle={`${match.competition?.name ?? "Freundschaftsspiel"}${match.matchdayLabel ? " · " + match.matchdayLabel : ""}`}
        actions={
          <>
            <Link href={`/aufstellung/${match.id}`} className="btn-secondary">
              <Shirt className="h-4 w-4" /> Aufstellung
            </Link>
            <Link href={`/taktik/${match.id}`} className="btn-secondary">
              <Target className="h-4 w-4" /> Taktik
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <MatchStatusBadge status={match.status} />
              {match.status === "PLAYED" && (
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl font-bold text-white">
                    {match.resultOwnScore}:{match.resultOpponentScore}
                  </span>
                  <OutcomeBadge outcome={outcome} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <InfoRow icon={CalendarDays} label="Datum & Uhrzeit" value={formatDateTime(match.date)} />
              <InfoRow icon={MapPin} label="Heim/Auswärts" value={HOME_AWAY_LABELS[match.homeAway as "HOME" | "AWAY"]} />
              <InfoRow icon={Trophy} label="Wettbewerb" value={match.competition?.name ?? "Freundschaftsspiel"} />
              {match.streamUrl && (
                <InfoRow
                  icon={Radio}
                  label="Stream"
                  value={
                    <a href={match.streamUrl} target="_blank" rel="noreferrer" className="text-wacker-red-light hover:underline">
                      {match.streamUrl}
                    </a>
                  }
                />
              )}
            </div>

            {match.notes && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-ink-200">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Notizen</p>
                {match.notes}
              </div>
            )}
          </div>

          {playerId && match.status !== "PLAYED" && match.status !== "CANCELLED" && (
            <div className="card p-5">
              <h2 className="section-title mb-3">Deine Rückmeldung</h2>
              <RsvpButtons
                matchId={match.id}
                initialStatus={(myAvailability?.status as any) ?? "PENDING"}
                initialReason={myAvailability?.reason}
              />
            </div>
          )}

          {match.lineup && starters.length > 0 && (
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Aufstellung</h2>
                {match.lineup.published ? (
                  <span className="badge bg-emerald-500/15 text-emerald-400">Veröffentlicht</span>
                ) : (
                  <span className="badge bg-amber-500/15 text-amber-400">Entwurf</span>
                )}
              </div>
              <Pitch formation={match.lineup.formation as Formation} assignments={assignments} />
              {bench.length > 0 && (
                <div className="mt-4">
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
          )}

          {match.tactic && (
            <div className="card p-5">
              <h2 className="section-title mb-3">Taktik</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <TacticStat label="Formation" value={match.tactic.formation} />
                <TacticStat label="Spielweise" value={TACTIC_STYLE_LABELS[match.tactic.style as "BALANCED"]} />
                <TacticStat label="Pressing" value={TACTIC_PRESSING_LABELS[match.tactic.pressing as "MID"]} />
                <TacticStat label="Tempo" value={TACTIC_TEMPO_LABELS[match.tactic.tempo as "NORMAL"]} />
              </div>
              {match.tactic.instructions && (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-ink-200">
                  {match.tactic.instructions}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {isLead && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Zu-/Absagen im Team</h2>
              <AvailabilityTable rows={match.availabilities as any} />
            </div>
          )}

          {isLead && (
            <div className="card flex flex-col gap-5 p-5">
              <h2 className="section-title">Spieltag verwalten</h2>
              <MatchStatusForm matchId={match.id} initialStatus={match.status} />
              {isManager && (
                <ResultForm matchId={match.id} initialOwn={match.resultOwnScore} initialOpp={match.resultOpponentScore} />
              )}
              <MatchNotesForm matchId={match.id} initialNotes={match.notes} />
              <DiscordAnnounceButton matchId={match.id} alreadyAnnounced={!!match.discordMessageId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-400" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
        <p className="font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

function TacticStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="font-display text-base font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { TacticEditor } from "@/components/TacticEditor";
import { formatDateTime } from "@/lib/utils";
import {
  Formation,
  TACTIC_STYLE_LABELS,
  TACTIC_PRESSING_LABELS,
  TACTIC_TEMPO_LABELS,
  TacticStyle,
  TacticPressing,
  TacticTempo,
} from "@/lib/constants";
import Link from "next/link";
import { CalendarDays, Gauge, Shield, Swords, Zap } from "lucide-react";

export default async function TaktikPage({ params }: { params: { matchId: string } }) {
  const session = await getServerSession(authOptions);
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    include: { tactic: true },
  });
  if (!match) notFound();

  const isLead = session!.user.role === "CAPTAIN" || session!.user.role === "MANAGER";

  const header = (
    <PageHeader
      title="Taktik"
      subtitle={`vs. ${match.opponent} · ${formatDateTime(match.date)}`}
      actions={
        <Link href={`/spielplan/${match.id}`} className="btn-secondary">
          <CalendarDays className="h-4 w-4" /> Spieltag-Details
        </Link>
      }
    />
  );

  if (isLead) {
    return (
      <div className="animate-fade-up">
        {header}
        <div className="card p-5 sm:p-6">
          <TacticEditor
            matchId={match.id}
            initial={{
              formation: (match.tactic?.formation as Formation) ?? "4-3-3",
              style: (match.tactic?.style as TacticStyle) ?? "BALANCED",
              pressing: (match.tactic?.pressing as TacticPressing) ?? "MID",
              tempo: (match.tactic?.tempo as TacticTempo) ?? "NORMAL",
              instructions: match.tactic?.instructions ?? "",
            }}
          />
        </div>
      </div>
    );
  }

  if (!match.tactic) {
    return (
      <div className="animate-fade-up">
        {header}
        <EmptyState title="Für dieses Spiel wurde noch keine Taktik festgelegt" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {header}
      <div className="card p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TacticStat icon={Swords} label="Formation" value={match.tactic.formation} />
          <TacticStat icon={Swords} label="Spielweise" value={TACTIC_STYLE_LABELS[match.tactic.style as TacticStyle]} />
          <TacticStat icon={Shield} label="Pressing" value={TACTIC_PRESSING_LABELS[match.tactic.pressing as TacticPressing]} />
          <TacticStat icon={Zap} label="Tempo" value={TACTIC_TEMPO_LABELS[match.tactic.tempo as TacticTempo]} />
        </div>
        {match.tactic.instructions && (
          <div className="mt-5">
            <p className="label flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" /> Taktische Anweisungen
            </p>
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-ink-200">
              {match.tactic.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TacticStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <Icon className="mx-auto mb-1.5 h-4 w-4 text-wacker-red-light" />
      <p className="font-display text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

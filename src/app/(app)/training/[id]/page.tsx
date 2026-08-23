import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { AvailabilityTable } from "@/components/AvailabilityTable";
import { TrainingRsvpButtons } from "@/components/TrainingRsvpButtons";
import { TrainingDeleteButton } from "@/components/TrainingDeleteButton";
import { TrainingDiscordAnnounceButton } from "@/components/TrainingDiscordAnnounceButton";
import { formatDateTime } from "@/lib/utils";
import { CalendarDays, Dumbbell, MapPin } from "lucide-react";

export default async function TrainingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const training = await prisma.training.findUnique({
    where: { id: params.id },
    include: { availabilities: { include: { player: true } } },
  });
  if (!training) notFound();

  const role = session!.user.role;
  const isLead = role === "CAPTAIN" || role === "MANAGER";
  const playerId = session!.user.playerId;
  const myAvailability = training.availabilities.find((a) => a.playerId === playerId);
  const isPast = new Date(training.date) < new Date();

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Training"
        subtitle={formatDateTime(training.date)}
        actions={
          isLead ? (
            <div className="flex items-center gap-2">
              <TrainingDeleteButton trainingId={training.id} />
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="badge bg-ink-600 text-ink-100">
                <Dumbbell className="h-3.5 w-3.5" /> Training
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <InfoRow icon={CalendarDays} label="Datum & Uhrzeit" value={formatDateTime(training.date)} />
              {training.location && <InfoRow icon={MapPin} label="Ort" value={training.location} />}
            </div>

            {training.notes && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-ink-200">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Notizen</p>
                {training.notes}
              </div>
            )}

            {isLead && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <TrainingDiscordAnnounceButton
                  trainingId={training.id}
                  alreadyAnnounced={!!training.discordMessageId}
                />
              </div>
            )}
          </div>

          {playerId && !isPast && (
            <div className="card p-5">
              <h2 className="section-title mb-3">Deine Rückmeldung</h2>
              <TrainingRsvpButtons
                trainingId={training.id}
                initialStatus={(myAvailability?.status as any) ?? "PENDING"}
                initialReason={myAvailability?.reason}
              />
            </div>
          )}
        </div>

        {isLead && (
          <div className="card p-5">
            <h2 className="section-title mb-3">Rückmeldungen</h2>
            <AvailabilityTable rows={training.availabilities as any} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-400" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
        <p className="text-ink-200">{value}</p>
      </div>
    </div>
  );
}

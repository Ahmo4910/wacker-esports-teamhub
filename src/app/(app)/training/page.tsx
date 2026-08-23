import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { TrainingCard } from "@/components/TrainingCard";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";

export default async function TrainingPage() {
  const session = await getServerSession(authOptions);
  const trainings = await prisma.training.findMany({
    orderBy: { date: "asc" },
    include: { availabilities: true },
  });

  const now = new Date();
  const upcoming = trainings.filter((t) => new Date(t.date) >= now);
  const past = trainings.filter((t) => new Date(t.date) < now).reverse();

  const canManage = session?.user.role === "CAPTAIN" || session?.user.role === "MANAGER";

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Training"
        subtitle="Alle kommenden und vergangenen Trainingstermine — mit Zu-/Absage wie bei Spieltagen."
        actions={
          canManage ? (
            <Link href="/training/neu" className="btn-primary">
              <CalendarPlus className="h-4 w-4" /> Training anlegen
            </Link>
          ) : undefined
        }
      />

      <section className="mb-8">
        <h2 className="section-title mb-3">Kommende Trainings</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Keine kommenden Trainings" subtitle="Aktuell ist kein Trainingstermin geplant." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((t) => (
              <TrainingCard key={t.id} training={t} href={`/training/${t.id}`} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title mb-3">Vergangene Trainings</h2>
        {past.length === 0 ? (
          <EmptyState title="Noch keine vergangenen Trainings" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((t) => (
              <TrainingCard key={t.id} training={t} href={`/training/${t.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

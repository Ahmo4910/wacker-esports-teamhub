import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { MatchCard } from "@/components/MatchCard";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";

export default async function SpielplanPage() {
  const session = await getServerSession(authOptions);
  const matches = await prisma.match.findMany({
    orderBy: { date: "asc" },
    include: { competition: true },
  });

  const upcoming = matches.filter((m) => m.status !== "PLAYED" && m.status !== "CANCELLED");
  const past = matches.filter((m) => m.status === "PLAYED" || m.status === "CANCELLED").reverse();

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Spielplan"
        subtitle="Alle kommenden und vergangenen Spiele von SV Wacker Burghausen eSports"
        actions={
          session?.user.role === "MANAGER" ? (
            <Link href="/admin/spieltage/neu" className="btn-primary">
              <CalendarPlus className="h-4 w-4" /> Spiel anlegen
            </Link>
          ) : undefined
        }
      />

      <section className="mb-8">
        <h2 className="section-title mb-3">Kommende Spiele</h2>
        {upcoming.length === 0 ? (
          <div className="card px-6 py-10 text-center text-ink-400">Keine kommenden Spiele geplant.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} href={`/spielplan/${m.id}`} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title mb-3">Vergangene Spiele</h2>
        {past.length === 0 ? (
          <div className="card px-6 py-10 text-center text-ink-400">Noch keine vergangenen Spiele.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((m) => (
              <MatchCard key={m.id} match={m} href={`/spielplan/${m.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getNextMatch } from "@/lib/matchQueries";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { MatchCard } from "@/components/MatchCard";

export default async function AufstellungIndexPage() {
  const next = await getNextMatch();
  if (next) redirect(`/aufstellung/${next.id}`);

  const recentPlayed = await prisma.match.findMany({
    where: { status: "PLAYED" },
    orderBy: { date: "desc" },
    take: 6,
    include: { competition: true },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader title="Aufstellung" subtitle="Kein anstehendes Spiel — hier sind die letzten Aufstellungen." />
      {recentPlayed.length === 0 ? (
        <EmptyState title="Keine Spiele vorhanden" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recentPlayed.map((m) => (
            <MatchCard key={m.id} match={m} href={`/aufstellung/${m.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

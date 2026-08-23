import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { NewMatchForm } from "@/components/NewMatchForm";

export default async function NewMatchPage() {
  const competitions = await prisma.competition.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="animate-fade-up">
      <PageHeader title="Spieltag erstellen" subtitle="Legt ein neues Spiel im Spielplan an und benachrichtigt das gesamte Team" />
      <div className="card max-w-3xl p-5 sm:p-6">
        <NewMatchForm competitions={competitions} />
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { AdminMatchTable } from "@/components/AdminMatchTable";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";

export default async function AdminSpieltagePage() {
  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    include: { competition: true },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Spieltage & Spiele verwalten"
        subtitle="Gegner, Termine, Liga und Ergebnisse pflegen"
        actions={
          <Link href="/admin/spieltage/neu" className="btn-primary">
            <CalendarPlus className="h-4 w-4" /> Spieltag anlegen
          </Link>
        }
      />
      <AdminMatchTable
        matches={matches.map((m) => ({ ...m, date: m.date.toISOString() })) as any}
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { AdminPlayerTable } from "@/components/AdminPlayerTable";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function AdminSpielerPage() {
  const players = await prisma.player.findMany({
    include: { user: true },
    orderBy: { gamerTag: "asc" },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Kaderverwaltung"
        subtitle="Spieler hinzufügen, bearbeiten, Rollen vergeben und entfernen"
        actions={
          <Link href="/admin/spieler/neu" className="btn-primary">
            <UserPlus className="h-4 w-4" /> Spieler hinzufügen
          </Link>
        }
      />
      <AdminPlayerTable players={players as any} />
    </div>
  );
}

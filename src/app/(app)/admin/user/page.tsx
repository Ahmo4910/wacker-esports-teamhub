import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { AdminUserTable } from "@/components/AdminUserTable";

export default async function AdminUserPage() {
  const users = await prisma.user.findMany({
    include: { player: { select: { gamerTag: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Benutzerverwaltung"
        subtitle="Rollen vergeben, Captain bestimmen, Manager verwalten, Konten (de)aktivieren oder Passwörter zurücksetzen"
      />
      <AdminUserTable users={users} />
    </div>
  );
}

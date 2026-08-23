import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { KaderView } from "@/components/KaderView";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function KaderPage() {
  const session = await getServerSession(authOptions);
  const players = await prisma.player.findMany({
    orderBy: [{ squadRole: "asc" }, { gamerTag: "asc" }],
    select: {
      id: true,
      gamerTag: true,
      realName: true,
      avatarUrl: true,
      primaryPosition: true,
      squadRole: true,
      status: true,
      jerseyNumber: true,
    },
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Kader"
        subtitle={`${players.length} Mitglieder im Team-Kader von SV Wacker Burghausen eSports`}
        actions={
          session?.user.role === "MANAGER" ? (
            <Link href="/admin/spieler/neu" className="btn-primary">
              <UserPlus className="h-4 w-4" /> Spieler hinzufügen
            </Link>
          ) : undefined
        }
      />
      <KaderView players={players} />
    </div>
  );
}

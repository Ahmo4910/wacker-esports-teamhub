import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { SquadRoleBadge } from "@/components/Badges";
import { PlayerEditForm } from "@/components/PlayerEditForm";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { SYSTEM_ROLE_LABELS } from "@/lib/constants";
import { Mail, ShieldCheck } from "lucide-react";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  const player = session!.user.playerId
    ? await prisma.player.findUnique({ where: { id: session!.user.playerId } })
    : null;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Profil" subtitle="Deine Kontodaten und Spielerprofil" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <Avatar name={session!.user.name} src={player?.avatarUrl} size="xl" />
          <div>
            <p className="font-display text-lg font-bold text-white">{session!.user.name}</p>
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <Mail className="h-3.5 w-3.5" /> {session!.user.email}
            </p>
          </div>
          <span className="badge bg-white/[0.06] text-ink-200">
            <ShieldCheck className="h-3.5 w-3.5" /> {SYSTEM_ROLE_LABELS[session!.user.role]}
          </span>
          {player && <SquadRoleBadge role={player.squadRole} />}
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          {player && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Spielerprofil bearbeiten</h2>
              <PlayerEditForm player={player} isManager={false} />
            </div>
          )}

          <div className="card p-5">
            <h2 className="section-title mb-4">Passwort ändern</h2>
            <PasswordChangeForm />
          </div>
        </div>
      </div>
    </div>
  );
}

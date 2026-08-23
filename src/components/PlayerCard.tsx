import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { SquadRoleBadge, PlayerStatusBadge } from "@/components/Badges";
import { POSITION_LABELS, Position } from "@/lib/constants";
import { Hash } from "lucide-react";

type PlayerLike = {
  id: string;
  gamerTag: string;
  realName?: string | null;
  avatarUrl?: string | null;
  primaryPosition?: string | null;
  squadRole: string;
  status: string;
  jerseyNumber?: number | null;
};

export function PlayerCard({ player }: { player: PlayerLike }) {
  return (
    <Link href={`/kader/${player.id}`} className="card card-hover group flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <Avatar name={player.gamerTag} src={player.avatarUrl} size="lg" />
        {player.jerseyNumber != null && (
          <span className="flex items-center gap-1 font-display text-2xl font-bold text-ink-500 group-hover:text-wacker-red-light/70">
            <Hash className="h-4 w-4" />
            {player.jerseyNumber}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-lg font-bold text-white">{player.gamerTag}</p>
        {player.realName && <p className="text-xs text-ink-400">{player.realName}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <SquadRoleBadge role={player.squadRole} />
        <PlayerStatusBadge status={player.status} />
      </div>
      {player.primaryPosition && (
        <p className="text-xs text-ink-400">
          {POSITION_LABELS[player.primaryPosition as Position]} ({player.primaryPosition})
        </p>
      )}
    </Link>
  );
}

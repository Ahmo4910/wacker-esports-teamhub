import Link from "next/link";
import { MatchStatusBadge, OutcomeBadge } from "@/components/Badges";
import { formatDateTime, relativeDay, matchOutcome } from "@/lib/utils";
import { HOME_AWAY_LABELS } from "@/lib/constants";
import { MapPin, Trophy } from "lucide-react";

type MatchLike = {
  id: string;
  opponent: string;
  date: Date | string;
  status: string;
  homeAway: string;
  matchdayLabel?: string | null;
  resultOwnScore?: number | null;
  resultOpponentScore?: number | null;
  competition?: { name: string } | null;
};

export function MatchCard({ match, href }: { match: MatchLike; href?: string }) {
  const outcome = matchOutcome(match.resultOwnScore, match.resultOpponentScore);
  const content = (
    <div className="card card-hover flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-300">
          <Trophy className="h-3.5 w-3.5" />
          {match.competition?.name ?? "Freundschaftsspiel"}
          {match.matchdayLabel ? ` · ${match.matchdayLabel}` : ""}
        </span>
        <MatchStatusBadge status={match.status} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-white">vs. {match.opponent}</p>
          <p className="flex items-center gap-1 text-xs text-ink-400">
            <MapPin className="h-3 w-3" />
            {HOME_AWAY_LABELS[match.homeAway as "HOME" | "AWAY"]}
          </p>
        </div>
        {match.status === "PLAYED" ? (
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-white">
              {match.resultOwnScore}:{match.resultOpponentScore}
            </p>
            <OutcomeBadge outcome={outcome} />
          </div>
        ) : (
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{relativeDay(match.date)}</p>
            <p className="text-xs text-ink-400">{formatDateTime(match.date)}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}

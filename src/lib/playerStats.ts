import { prisma } from "@/lib/prisma";
import { matchOutcome } from "@/lib/utils";

export async function getPlayerStats(playerId: string) {
  const slots = await prisma.lineupSlot.findMany({
    where: { playerId, lineup: { match: { status: "PLAYED" } } },
    include: { lineup: { include: { match: true } } },
  });

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let starts = 0;
  let subApps = 0;

  for (const slot of slots) {
    const m = slot.lineup.match;
    const outcome = matchOutcome(m.resultOwnScore, m.resultOpponentScore);
    if (outcome === "WIN") wins++;
    else if (outcome === "DRAW") draws++;
    else if (outcome === "LOSS") losses++;
    if (slot.isStarter) starts++;
    else subApps++;
  }

  return {
    appearances: slots.length,
    starts,
    subApps,
    wins,
    draws,
    losses,
  };
}

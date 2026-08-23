import { prisma } from "@/lib/prisma";

export function nextMatchWhere() {
  return {
    status: { in: ["SCHEDULED", "LINEUP_OPEN", "LINEUP_PUBLISHED"] },
    date: { gte: new Date(Date.now() - 1000 * 60 * 60 * 3) }, // kleine Toleranz für laufende Spiele
  };
}

export async function getNextMatch() {
  return prisma.match.findFirst({
    where: nextMatchWhere(),
    orderBy: { date: "asc" },
    include: {
      competition: true,
      availabilities: { include: { player: { include: { user: true } } } },
      lineup: { include: { slots: { include: { player: { include: { user: true } } } } } },
      tactic: true,
    },
  });
}

export async function getUpcomingMatches(limit = 5, excludeId?: string) {
  return prisma.match.findMany({
    where: {
      ...nextMatchWhere(),
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { date: "asc" },
    take: limit,
    include: { competition: true, availabilities: true },
  });
}

export async function getRecentResults(limit = 5) {
  return prisma.match.findMany({
    where: { status: "PLAYED" },
    orderBy: { date: "desc" },
    take: limit,
    include: { competition: true },
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";
import { notifyTeam, notifyUsers } from "@/lib/notifications";
import { sendWebhookAnnouncement } from "@/lib/discord";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });

  const lineup = await prisma.lineup.findUnique({
    where: { matchId: params.id },
    include: { slots: { include: { player: { include: { user: true } } } } },
  });
  if (!lineup) return NextResponse.json({ error: "Es existiert noch kein Aufstellungs-Entwurf." }, { status: 400 });

  const updated = await prisma.lineup.update({
    where: { id: lineup.id },
    data: { published: true, publishedAt: new Date(), updatedById: session!.user.id },
  });

  await prisma.match.update({ where: { id: match.id }, data: { status: "LINEUP_PUBLISHED" } });

  const selectedUserIds = lineup.slots.filter((s) => s.player).map((s) => s.player!.userId);
  await notifyUsers(selectedUserIds, {
    type: "SELECTED",
    title: "Du wurdest für das nächste Spiel ausgewählt",
    message: `Du stehst im Kader für das Spiel gegen ${match.opponent}.`,
    link: `/aufstellung/${match.id}`,
  });

  await notifyTeam({
    type: "LINEUP_PUBLISHED",
    title: "Die Aufstellung wurde veröffentlicht",
    message: `Die Aufstellung für das Spiel gegen ${match.opponent} steht jetzt fest.`,
    link: `/aufstellung/${match.id}`,
    excludeUserId: session!.user.id,
  });

  try {
    const starters = lineup.slots.filter((s) => s.isStarter && s.player).map((s) => s.player!.gamerTag);
    await sendWebhookAnnouncement({
      title: `🚀 Aufstellung veröffentlicht: vs. ${match.opponent}`,
      description: starters.length > 0 ? `**Startelf:** ${starters.join(", ")}` : undefined,
    });
  } catch {
    // in-app Benachrichtigung wurde bereits erstellt, Discord ist optional
  }

  return NextResponse.json({ lineup: updated });
}

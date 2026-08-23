import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";
import { postMatchAnnouncementWithButtons, isBotConfigured } from "@/lib/discord";
import { formatDateTime } from "@/lib/utils";
import { HOME_AWAY_LABELS } from "@/lib/constants";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  if (!isBotConfigured()) {
    return NextResponse.json(
      {
        error:
          "Discord-Bot ist nicht konfiguriert. Bitte DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY und DISCORD_CHANNEL_ID in den Umgebungsvariablen setzen (siehe README → Discord-Integration).",
      },
      { status: 400 }
    );
  }

  const match = await prisma.match.findUnique({ where: { id: params.id }, include: { competition: true } });
  if (!match) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });

  const appUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

  try {
    const { messageId, channelId } = await postMatchAnnouncementWithButtons({
      matchId: match.id,
      opponent: match.opponent,
      competition: match.competition?.name,
      matchdayLabel: match.matchdayLabel,
      dateLabel: formatDateTime(match.date),
      homeAway: HOME_AWAY_LABELS[match.homeAway as "HOME" | "AWAY"] as "Heim" | "Auswärts",
      appUrl,
    });

    await prisma.match.update({
      where: { id: match.id },
      data: { discordMessageId: messageId, discordChannelId: channelId },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Discord-Ankündigung fehlgeschlagen." }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";
import { postTrainingAnnouncementWithButtons, isBotConfigured } from "@/lib/discord";
import { formatDateTime } from "@/lib/utils";

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

  const training = await prisma.training.findUnique({ where: { id: params.id } });
  if (!training) return NextResponse.json({ error: "Training nicht gefunden." }, { status: 404 });

  const appUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

  try {
    const { messageId, channelId } = await postTrainingAnnouncementWithButtons({
      trainingId: training.id,
      dateLabel: formatDateTime(training.date),
      location: training.location,
      notes: training.notes,
      appUrl,
    });

    await prisma.training.update({
      where: { id: training.id },
      data: { discordMessageId: messageId, discordChannelId: channelId },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Discord-Ankündigung fehlgeschlagen." }, { status: 502 });
  }
}

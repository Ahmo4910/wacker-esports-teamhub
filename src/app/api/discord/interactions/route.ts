import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDiscordRequest } from "@/lib/discord";
import { notifyUsers } from "@/lib/notifications";

// Discord Interaction-Typen (siehe Discord API Docs)
const PING = 1;
const APPLICATION_COMMAND = 2;
const MESSAGE_COMPONENT = 3;

const PONG = 1;
const CHANNEL_MESSAGE_WITH_SOURCE = 4;

const EPHEMERAL = 1 << 6;

function reply(content: string) {
  return NextResponse.json({
    type: CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content, flags: EPHEMERAL },
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  if (!verifyDiscordRequest(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: "Ungültige Signatur." }, { status: 401 });
  }

  const interaction = JSON.parse(rawBody);

  if (interaction.type === PING) {
    return NextResponse.json({ type: PONG });
  }

  if (interaction.type === MESSAGE_COMPONENT) {
    const customId: string = interaction.data?.custom_id ?? "";
    const [namespace, action, matchId] = customId.split(":");

    if (namespace !== "rsvp" || !matchId) {
      return reply("Unbekannte Aktion.");
    }

    const discordUserId: string | undefined = interaction.member?.user?.id ?? interaction.user?.id;
    if (!discordUserId) {
      return reply("Konnte deinen Discord-Account nicht ermitteln.");
    }

    const player = await prisma.player.findUnique({ where: { discordUserId } });
    if (!player) {
      return reply(
        "Dein Discord-Konto ist noch nicht mit einem Spielerprofil im Team-Hub verknüpft.\n" +
          "Bitte im Team-Hub unter „Profil“ deine Discord-User-ID hinterlegen (Discord → Einstellungen → " +
          "Erweitert → Entwicklermodus aktivieren, dann per Rechtsklick auf dein Profil „ID kopieren“)."
      );
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return reply("Dieser Spieltag existiert nicht mehr.");
    }

    if (action !== "accept" && action !== "decline") {
      return reply("Unbekannte Aktion.");
    }

    const status = action === "accept" ? "ACCEPTED" : "DECLINED";

    await prisma.availability.upsert({
      where: { matchId_playerId: { matchId, playerId: player.id } },
      update: { status, reason: null, respondedAt: new Date() },
      create: { matchId, playerId: player.id, status, respondedAt: new Date() },
    });

    if (status === "DECLINED") {
      const leads = await prisma.user.findMany({
        where: { role: { in: ["CAPTAIN", "MANAGER"] }, active: true },
        select: { id: true },
      });
      await notifyUsers(
        leads.map((l) => l.id),
        {
          type: "PLAYER_DECLINED",
          title: "Ein Spieler hat für das Spiel abgesagt",
          message: `${player.gamerTag} hat über Discord für das Spiel gegen ${match.opponent} abgesagt.`,
          link: `/spielplan/${match.id}`,
        }
      );
    }

    return reply(
      status === "ACCEPTED"
        ? `✅ Danke ${player.gamerTag}, deine Zusage für das Spiel gegen ${match.opponent} wurde gespeichert.`
        : `❌ Okay ${player.gamerTag}, deine Absage für das Spiel gegen ${match.opponent} wurde gespeichert. Einen Grund kannst du optional noch im Team-Hub eintragen.`
    );
  }

  if (interaction.type === APPLICATION_COMMAND) {
    return reply("Dieser Befehl wird aktuell nicht unterstützt.");
  }

  return NextResponse.json({ error: "Unbekannter Interaction-Typ." }, { status: 400 });
}

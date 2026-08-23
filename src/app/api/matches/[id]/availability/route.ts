import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/apiAuth";
import { notifyUsers } from "@/lib/notifications";
import { z } from "zod";

// GET: Liste aller Zu-/Absagen für ein Spiel (nur Captain/Manager -- Spieler sehen nur öffentliche Übersicht auf der Seite selbst per Server Component)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  const list = await prisma.availability.findMany({
    where: { matchId: params.id },
    include: { player: { include: { user: true } } },
    orderBy: { player: { gamerTag: "asc" } },
  });
  return NextResponse.json({ availabilities: list });
}

const bodySchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
  reason: z.string().max(300).optional().nullable(),
});

// POST: der eingeloggte Spieler selbst sagt zu oder ab
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error) return error;

  if (!session!.user.playerId) {
    return NextResponse.json({ error: "Für diesen Account existiert kein Spielerprofil." }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });

  const availability = await prisma.availability.upsert({
    where: { matchId_playerId: { matchId: params.id, playerId: session!.user.playerId } },
    update: {
      status: parsed.data.status,
      reason: parsed.data.status === "DECLINED" ? parsed.data.reason ?? null : null,
      respondedAt: new Date(),
    },
    create: {
      matchId: params.id,
      playerId: session!.user.playerId,
      status: parsed.data.status,
      reason: parsed.data.status === "DECLINED" ? parsed.data.reason ?? null : null,
      respondedAt: new Date(),
    },
    include: { player: true },
  });

  // Captain & Manager benachrichtigen bei Absage
  if (parsed.data.status === "DECLINED") {
    const leads = await prisma.user.findMany({
      where: { role: { in: ["CAPTAIN", "MANAGER"] }, active: true },
      select: { id: true },
    });
    await notifyUsers(
      leads.map((l) => l.id),
      {
        type: "PLAYER_DECLINED",
        title: "Ein Spieler hat für das Spiel abgesagt",
        message: `${availability.player.gamerTag} hat für das Spiel gegen ${match.opponent} abgesagt${
          parsed.data.reason ? ` (Grund: ${parsed.data.reason})` : ""
        }.`,
        link: `/spielplan/${match.id}`,
      }
    );
  }

  return NextResponse.json({ availability });
}

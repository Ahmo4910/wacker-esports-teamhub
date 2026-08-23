import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/apiAuth";
import { notifyUsers } from "@/lib/notifications";
import { formatDateTime } from "@/lib/utils";
import { z } from "zod";

// GET: Liste aller Zu-/Absagen für einen Trainingstermin (nur Captain/Manager)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  const list = await prisma.trainingAvailability.findMany({
    where: { trainingId: params.id },
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

  const training = await prisma.training.findUnique({ where: { id: params.id } });
  if (!training) return NextResponse.json({ error: "Training nicht gefunden." }, { status: 404 });

  const availability = await prisma.trainingAvailability.upsert({
    where: { trainingId_playerId: { trainingId: params.id, playerId: session!.user.playerId } },
    update: {
      status: parsed.data.status,
      reason: parsed.data.status === "DECLINED" ? parsed.data.reason ?? null : null,
      respondedAt: new Date(),
    },
    create: {
      trainingId: params.id,
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
        title: "Ein Spieler hat für das Training abgesagt",
        message: `${availability.player.gamerTag} hat für das Training am ${formatDateTime(training.date)} abgesagt${
          parsed.data.reason ? ` (Grund: ${parsed.data.reason})` : ""
        }.`,
        link: `/training/${training.id}`,
      }
    );
  }

  return NextResponse.json({ availability });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { FORMATIONS } from "@/lib/constants";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireSession();
  if (error) return error;

  const lineup = await prisma.lineup.findUnique({
    where: { matchId: params.id },
    include: { slots: { include: { player: { include: { user: true } } } } },
  });
  return NextResponse.json({ lineup });
}

const slotSchema = z.object({
  slotKey: z.string(),
  isStarter: z.boolean(),
  order: z.number().int().default(0),
  playerId: z.string().nullable(),
});

const putSchema = z.object({
  formation: z.enum(FORMATIONS),
  slots: z.array(slotSchema),
});

// PUT: Entwurf speichern (Captain/Manager). Ersetzt alle Slots der Aufstellung.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const filledSlots = d.slots.filter((s) => s.playerId);
  const uniquePlayerIds = new Set(filledSlots.map((s) => s.playerId));
  if (uniquePlayerIds.size !== filledSlots.length) {
    return NextResponse.json({ error: "Ein Spieler kann nicht mehrfach aufgestellt werden." }, { status: 400 });
  }

  const lineup = await prisma.lineup.upsert({
    where: { matchId: params.id },
    update: { formation: d.formation, updatedById: session!.user.id },
    create: { matchId: params.id, formation: d.formation, updatedById: session!.user.id },
  });

  await prisma.lineupSlot.deleteMany({ where: { lineupId: lineup.id } });
  if (d.slots.length > 0) {
    await prisma.lineupSlot.createMany({
      data: d.slots.map((s) => ({
        lineupId: lineup.id,
        slotKey: s.slotKey,
        isStarter: s.isStarter,
        order: s.order,
        playerId: s.playerId,
      })),
    });
  }

  if (match.status === "SCHEDULED") {
    await prisma.match.update({ where: { id: match.id }, data: { status: "LINEUP_OPEN" } });
  }

  const fresh = await prisma.lineup.findUnique({
    where: { id: lineup.id },
    include: { slots: { include: { player: { include: { user: true } } } } },
  });

  return NextResponse.json({ lineup: fresh });
}

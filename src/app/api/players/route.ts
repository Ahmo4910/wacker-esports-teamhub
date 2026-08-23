import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { notifyTeam } from "@/lib/notifications";
import { POSITIONS, SQUAD_ROLES, SYSTEM_ROLES } from "@/lib/constants";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const players = await prisma.player.findMany({
    include: { user: true },
    orderBy: [{ squadRole: "asc" }, { gamerTag: "asc" }],
  });
  return NextResponse.json({ players });
}

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  gamerTag: z.string().min(2),
  realName: z.string().optional().nullable(),
  primaryPosition: z.enum(POSITIONS).nullable().optional(),
  secondaryPosition: z.enum(POSITIONS).nullable().optional(),
  squadRole: z.enum(SQUAD_ROLES),
  systemRole: z.enum(SYSTEM_ROLES),
  jerseyNumber: z.number().int().min(0).max(99).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  discordTag: z.string().max(60).optional().nullable(),
});

// POST: neuen Spieler anlegen (nur Manager)
export async function POST(req: Request) {
  const { error } = await requireRole(["MANAGER"]);
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: "Es existiert bereits ein Konto mit dieser E-Mail." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: d.email.toLowerCase().trim(),
      name: d.name,
      passwordHash: await bcrypt.hash(d.password, 10),
      role: d.systemRole,
    },
  });

  const player = await prisma.player.create({
    data: {
      userId: user.id,
      gamerTag: d.gamerTag,
      realName: d.realName || null,
      primaryPosition: d.primaryPosition || null,
      secondaryPosition: d.secondaryPosition || null,
      squadRole: d.squadRole,
      jerseyNumber: d.jerseyNumber ?? null,
      bio: d.bio || null,
      discordTag: d.discordTag || null,
    },
    include: { user: true },
  });

  await notifyTeam({
    type: "GENERAL",
    title: "Neuer Spieler im Kader",
    message: `${player.gamerTag} (${d.name}) wurde von der Team-Führung zum Kader hinzugefügt.`,
    link: `/kader/${player.id}`,
  });

  return NextResponse.json({ player }, { status: 201 });
}

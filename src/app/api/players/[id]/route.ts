import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { PLAYER_STATUS, POSITIONS, SQUAD_ROLES, SYSTEM_ROLES } from "@/lib/constants";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireSession();
  if (error) return error;

  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!player) return NextResponse.json({ error: "Spieler nicht gefunden." }, { status: 404 });
  return NextResponse.json({ player });
}

const selfEditSchema = z.object({
  gamerTag: z.string().min(2).optional(),
  realName: z.string().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  discordTag: z.string().max(60).optional().nullable(),
  discordUserId: z
    .string()
    .regex(/^\d{15,25}$/, "Discord-User-ID besteht nur aus Ziffern (typischerweise 17-19 Stellen).")
    .optional()
    .nullable()
    .or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  secondaryPosition: z.enum(POSITIONS).optional().nullable(),
  status: z.enum(PLAYER_STATUS).optional(),
});

const managerEditSchema = selfEditSchema.extend({
  primaryPosition: z.enum(POSITIONS).optional().nullable(),
  squadRole: z.enum(SQUAD_ROLES).optional(),
  systemRole: z.enum(SYSTEM_ROLES).optional(),
  jerseyNumber: z.number().int().min(0).max(99).optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const player = await prisma.player.findUnique({ where: { id: params.id } });
  if (!player) return NextResponse.json({ error: "Spieler nicht gefunden." }, { status: 404 });

  const isSelf = player.userId === session!.user.id;
  const isManager = session!.user.role === "MANAGER";

  if (!isSelf && !isManager) {
    return NextResponse.json({ error: "Nicht berechtigt, dieses Profil zu bearbeiten." }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const schema = isManager ? managerEditSchema : selfEditSchema;
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d: any = parsed.data;
  if (d.avatarUrl === "") d.avatarUrl = null;
  if (d.discordUserId === "") d.discordUserId = null;

  const { systemRole, active, ...playerFields } = d;

  let updatedPlayer;
  try {
    updatedPlayer = await prisma.player.update({
      where: { id: params.id },
      data: playerFields,
      include: { user: true },
    });
  } catch (e: any) {
    if (e.code === "P2002" && e.meta?.target?.includes?.("discordUserId")) {
      return NextResponse.json(
        { error: "Diese Discord-User-ID ist bereits mit einem anderen Spielerprofil verknüpft." },
        { status: 409 }
      );
    }
    throw e;
  }

  if (isManager && (systemRole || active !== undefined)) {
    await prisma.user.update({
      where: { id: player.userId },
      data: {
        ...(systemRole ? { role: systemRole } : {}),
        ...(active !== undefined ? { active } : {}),
      },
    });
  }

  return NextResponse.json({ player: updatedPlayer });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["MANAGER"]);
  if (error) return error;

  const player = await prisma.player.findUnique({ where: { id: params.id } });
  if (!player) return NextResponse.json({ error: "Spieler nicht gefunden." }, { status: 404 });

  // Löscht den zugehörigen User (kaskadiert per Prisma-Relation auf Player, Availability, LineupSlot, Notification)
  await prisma.user.delete({ where: { id: player.userId } });

  return NextResponse.json({ ok: true });
}

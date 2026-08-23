import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";
import { SYSTEM_ROLES } from "@/lib/constants";
import { notifyUser } from "@/lib/notifications";

const patchSchema = z.object({
  role: z.enum(SYSTEM_ROLES).optional(),
  active: z.boolean().optional(),
  name: z.string().min(2).optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireRole(["MANAGER"]);
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  if (params.id === session!.user.id && d.role && d.role !== "MANAGER") {
    return NextResponse.json({ error: "Du kannst dir nicht selbst die Manager-Rechte entziehen." }, { status: 400 });
  }
  if (params.id === session!.user.id && d.active === false) {
    return NextResponse.json({ error: "Du kannst dein eigenes Konto nicht deaktivieren." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(d.role ? { role: d.role } : {}),
      ...(d.active !== undefined ? { active: d.active } : {}),
      ...(d.name ? { name: d.name } : {}),
      ...(d.newPassword ? { passwordHash: await bcrypt.hash(d.newPassword, 10) } : {}),
    },
    include: { player: true },
  });

  if (d.role) {
    // Teamrolle des Spielerprofils an neue System-Rolle angleichen, falls sinnvoll
    if (user.player && (d.role === "CAPTAIN" || d.role === "MANAGER")) {
      await prisma.player.update({ where: { id: user.player.id }, data: { squadRole: d.role } });
    }
    await notifyUser({
      userId: user.id,
      type: "GENERAL",
      title: "Deine Rolle wurde geändert",
      message: `Ein Manager hat deine Rolle auf "${d.role}" geändert.`,
    });
  }

  if (d.newPassword) {
    await notifyUser({
      userId: user.id,
      type: "GENERAL",
      title: "Passwort wurde zurückgesetzt",
      message: "Ein Manager hat dein Passwort zurückgesetzt. Bitte melde dich mit dem neuen Passwort an.",
    });
  }

  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireRole(["MANAGER"]);
  if (error) return error;

  if (params.id === session!.user.id) {
    return NextResponse.json({ error: "Du kannst dein eigenes Konto nicht löschen." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/apiAuth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Neues Passwort muss mindestens 8 Zeichen haben."),
});

export async function POST(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Aktuelles Passwort ist falsch." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });

  return NextResponse.json({ ok: true });
}

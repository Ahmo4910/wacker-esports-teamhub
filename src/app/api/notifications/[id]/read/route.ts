import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const notif = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notif || notif.userId !== session!.user.id) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  await prisma.notification.update({ where: { id: params.id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}

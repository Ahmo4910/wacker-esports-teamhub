import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/apiAuth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  const training = await prisma.training.findUnique({ where: { id: params.id } });
  if (!training) return NextResponse.json({ error: "Training nicht gefunden." }, { status: 404 });

  await prisma.training.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}

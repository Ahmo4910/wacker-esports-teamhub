import { NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireRole(["MANAGER"]);
  if (error) return error;

  const users = await prisma.user.findMany({
    include: { player: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session!.user.id, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId: session!.user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH: alle Benachrichtigungen des Benutzers als gelesen markieren
export async function PATCH() {
  const { session, error } = await requireSession();
  if (error) return error;

  await prisma.notification.updateMany({
    where: { userId: session!.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}

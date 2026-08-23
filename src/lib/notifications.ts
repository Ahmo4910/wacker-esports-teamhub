import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/lib/constants";

/** Erstellt eine Benachrichtigung für genau einen Benutzer. */
export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}

/** Erstellt dieselbe Benachrichtigung für mehrere Benutzer (Broadcast). */
export async function notifyUsers(
  userIds: string[],
  params: { type: NotificationType; title: string; message: string; link?: string }
) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    })),
  });
}

/** Benachrichtigt das gesamte aktive Team (alle Benutzer mit Spielerprofil + Staff). */
export async function notifyTeam(params: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  excludeUserId?: string;
}) {
  const users = await prisma.user.findMany({
    where: { active: true, id: params.excludeUserId ? { not: params.excludeUserId } : undefined },
    select: { id: true },
  });
  await notifyUsers(
    users.map((u) => u.id),
    params
  );
}

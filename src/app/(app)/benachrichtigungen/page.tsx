import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { NotificationList } from "@/components/NotificationList";

export default async function BenachrichtigungenPage() {
  const session = await getServerSession(authOptions);
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="animate-fade-up">
      <PageHeader title="Benachrichtigungen" subtitle="Alle Neuigkeiten rund um Team, Spieltage und Aufstellungen" />
      <NotificationList
        notifications={notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SidebarNav, MobileBottomNav } from "@/components/Nav";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const unread = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-white/10 bg-ink-950/60 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
          <Logo className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-wide text-white">WACKER</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wacker-red-light">
              eSports Hub
            </p>
          </div>
        </Link>
        <SidebarNav role={session.user.role} unread={unread} />
        <div className="mx-3 mb-4 mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-[11px] text-ink-400">
          © {new Date().getFullYear()} SV Wacker Burghausen eSports
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar name={session.user.name} role={session.user.role} unread={unread} />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

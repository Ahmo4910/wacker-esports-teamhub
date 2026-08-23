"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { NotificationBell } from "@/components/NotificationBell";
import { SYSTEM_ROLE_LABELS, SystemRole } from "@/lib/constants";
import { LogOut, Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/Nav";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export function TopBar({
  name,
  role,
  unread,
}: {
  name: string;
  role: SystemRole;
  unread: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-ink-900/90 px-4 backdrop-blur-lg sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-200 hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <Logo className="h-8 w-8" />
            <span className="font-display text-sm font-bold tracking-wide text-white">WACKER eSPORTS</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell initialUnread={unread} />
          <div className="hidden items-center gap-2.5 sm:flex">
            <Avatar name={name} size="sm" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-[11px] text-ink-400">{SYSTEM_ROLE_LABELS[role]}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-200 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10 bg-ink-950 animate-fade-up">
            <div className="flex items-center justify-between px-4 py-4">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <Logo className="h-8 w-8" />
                <span className="font-display text-sm font-bold tracking-wide text-white">WACKER eSPORTS</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setMobileOpen(false)}>
              <SidebarNav role={role} unread={unread} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

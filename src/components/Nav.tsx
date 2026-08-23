"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ListChecks,
  Dumbbell,
  Shirt,
  Target,
  Trophy,
  Bell,
  UserCircle,
  ShieldCheck,
  Settings2,
} from "lucide-react";

export type NavRole = "PLAYER" | "CAPTAIN" | "MANAGER";

const MAIN_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kader", label: "Kader", icon: Users },
  { href: "/spielplan", label: "Spielplan", icon: CalendarDays },
  { href: "/spieltage", label: "Spieltage", icon: ListChecks },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/aufstellung", label: "Aufstellung", icon: Shirt },
  { href: "/taktik", label: "Taktik", icon: Target },
  { href: "/ergebnisse", label: "Ergebnisse", icon: Trophy },
  { href: "/benachrichtigungen", label: "Benachrichtigungen", icon: Bell },
  { href: "/profil", label: "Profil", icon: UserCircle },
];

export function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav({ role, unread }: { role: NavRole; unread: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
        Team-Hub
      </p>
      {MAIN_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("nav-link relative", active && "nav-link-active")}
          >
            <Icon className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/benachrichtigungen" && unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-wacker-red px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        );
      })}

      {(role === "CAPTAIN" || role === "MANAGER") && (
        <>
          <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            Führung
          </p>
          <Link
            href="/captain"
            className={cn("nav-link", isActive(pathname, "/captain") && "nav-link-active")}
          >
            <ShieldCheck className="h-[18px] w-[18px] flex-shrink-0" />
            Captain-Bereich
          </Link>
        </>
      )}

      {role === "MANAGER" && (
        <Link
          href="/admin"
          className={cn("nav-link", isActive(pathname, "/admin") && "nav-link-active")}
        >
          <Settings2 className="h-[18px] w-[18px] flex-shrink-0" />
          Admin / Manager
        </Link>
      )}
    </nav>
  );
}

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/spielplan", label: "Spiele", icon: CalendarDays },
  { href: "/aufstellung", label: "Elf", icon: Shirt },
  { href: "/kader", label: "Kader", icon: Users },
  { href: "/profil", label: "Profil", icon: UserCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-stretch justify-between px-1">
        {MOBILE_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-ink-400 transition-colors",
                active && "text-wacker-red-light"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

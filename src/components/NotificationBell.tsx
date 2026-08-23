"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type NotifItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications?limit=1&unreadOnly=true");
        if (res.ok) {
          const data = await res.json();
          setUnread(data.unreadCount ?? 0);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      try {
        const res = await fetch("/api/notifications?limit=8");
        if (res.ok) {
          const data = await res.json();
          setItems(data.notifications ?? []);
          setUnread(data.unreadCount ?? 0);
          setLoaded(true);
        }
      } catch {}
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnread(0);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        aria-label="Benachrichtigungen"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-200 transition-colors hover:bg-white/[0.08] hover:text-white"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-wacker-red px-1 text-[10px] font-bold text-white ring-2 ring-ink-900">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] animate-fade-up card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">Benachrichtigungen</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-wacker-red-light hover:text-white">
                Alle gelesen
              </button>
            )}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink-400">Keine Benachrichtigungen.</p>
            )}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/benachrichtigungen"}
                onClick={() => setOpen(false)}
                className={cn(
                  "block border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.04]",
                  !n.read && "bg-wacker-red/[0.06]"
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-wacker-red" />}
                  <div className={cn(n.read && "pl-3.5")}>
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-300">{n.message}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/benachrichtigungen"
            onClick={() => setOpen(false)}
            className="block border-t border-white/10 px-4 py-2.5 text-center text-xs font-semibold text-wacker-red-light hover:bg-white/[0.04]"
          >
            Alle anzeigen
          </Link>
        </div>
      )}
    </div>
  );
}

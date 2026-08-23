"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarPlus,
  ShieldCheck,
  Rocket,
  Target,
  Clock3,
  UserX,
  Trophy,
  Dumbbell,
} from "lucide-react";

type Notif = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const ICONS: Record<string, any> = {
  MATCHDAY_CREATED: CalendarPlus,
  SELECTED: ShieldCheck,
  LINEUP_PUBLISHED: Rocket,
  TACTIC_UPDATED: Target,
  MATCH_REMINDER: Clock3,
  PLAYER_DECLINED: UserX,
  RESULT_ENTERED: Trophy,
  TRAINING_CREATED: Dumbbell,
  GENERAL: Bell,
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `vor ${d} Tag${d > 1 ? "en" : ""}`;
  return new Date(iso).toLocaleDateString("de-DE");
}

export function NotificationList({ notifications }: { notifications: Notif[] }) {
  const [items, setItems] = useState(notifications);

  async function markRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    } catch {}
  }

  if (items.length === 0) {
    return <div className="card px-6 py-14 text-center text-ink-400">Noch keine Benachrichtigungen vorhanden.</div>;
  }

  return (
    <div className="space-y-2.5">
      {items.map((n) => {
        const Icon = ICONS[n.type] ?? Bell;
        const body = (
          <div
            className={cn(
              "card card-hover flex items-start gap-3.5 p-4",
              !n.read && "border-wacker-red/30 bg-wacker-red/[0.04]"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                n.read ? "bg-white/[0.06] text-ink-400" : "bg-wacker-red/15 text-wacker-red-light"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <span className="flex-shrink-0 text-[11px] text-ink-500">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-sm text-ink-300">{n.message}</p>
            </div>
            {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-wacker-red" />}
          </div>
        );

        return n.link ? (
          <Link key={n.id} href={n.link} onClick={() => markRead(n.id)}>
            {body}
          </Link>
        ) : (
          <div key={n.id} onClick={() => markRead(n.id)} className="cursor-pointer">
            {body}
          </div>
        );
      })}
    </div>
  );
}

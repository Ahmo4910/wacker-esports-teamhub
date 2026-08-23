import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { CalendarDays, Settings2, UserCog, Users } from "lucide-react";

export default async function AdminPage() {
  const [players, matches, users, upcoming] = await Promise.all([
    prisma.player.count(),
    prisma.match.count(),
    prisma.user.count(),
    prisma.match.count({ where: { status: { in: ["SCHEDULED", "LINEUP_OPEN", "LINEUP_PUBLISHED"] } } }),
  ]);

  const cards = [
    {
      href: "/admin/spieler",
      icon: Users,
      title: "Kaderverwaltung",
      desc: "Spieler hinzufügen, bearbeiten, entfernen und Rollen vergeben.",
      stat: `${players} Spieler`,
    },
    {
      href: "/admin/spieltage",
      icon: CalendarDays,
      title: "Spieltage & Spiele",
      desc: "Spieltage anlegen, Gegner, Termine, Liga und Ergebnisse verwalten.",
      stat: `${matches} Spiele · ${upcoming} anstehend`,
    },
    {
      href: "/admin/user",
      icon: UserCog,
      title: "Benutzerverwaltung",
      desc: "Rollen vergeben, Captain bestimmen, Manager verwalten, Konten (de)aktivieren.",
      stat: `${users} Benutzerkonten`,
    },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Admin / Manager"
        subtitle="Zentrale Verwaltung für SV Wacker Burghausen eSports"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card card-hover flex flex-col gap-3 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-wacker-red/15 text-wacker-red-light">
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">{c.title}</p>
              <p className="mt-1 text-sm text-ink-300">{c.desc}</p>
            </div>
            <p className="mt-auto text-xs font-semibold uppercase tracking-wide text-ink-400">{c.stat}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 card flex items-start gap-3 p-5">
        <Settings2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-ink-400" />
        <p className="text-sm text-ink-300">
          Als Manager hast du die höchsten Rechte im System: Du kannst den kompletten Kader, alle Spieltage,
          Ergebnisse, Rollen und Benutzerkonten verwalten. Captain-Funktionen (Aufstellung & Taktik) findest du
          zusätzlich im{" "}
          <Link href="/captain" className="text-wacker-red-light hover:underline">
            Captain-Bereich
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

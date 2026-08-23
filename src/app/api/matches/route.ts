import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { notifyTeam } from "@/lib/notifications";
import { sendWebhookAnnouncement } from "@/lib/discord";
import { HOME_AWAY, HOME_AWAY_LABELS, MATCH_STATUS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export async function GET(req: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope"); // "upcoming" | "past" | null (=all)

  const where =
    scope === "upcoming"
      ? { status: { in: ["SCHEDULED", "LINEUP_OPEN", "LINEUP_PUBLISHED"] } }
      : scope === "past"
      ? { status: { in: ["PLAYED", "CANCELLED"] } }
      : {};

  const matches = await prisma.match.findMany({
    where,
    orderBy: { date: scope === "past" ? "desc" : "asc" },
    include: { competition: true, availabilities: true, lineup: { select: { published: true } } },
  });

  return NextResponse.json({ matches });
}

const createSchema = z.object({
  opponent: z.string().min(2),
  date: z.string(), // ISO datetime-local string
  competitionId: z.string().optional().nullable(),
  newCompetitionName: z.string().optional().nullable(),
  matchdayLabel: z.string().optional().nullable(),
  homeAway: z.enum(HOME_AWAY),
  streamUrl: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
  status: z.enum(MATCH_STATUS).optional(),
});

export async function POST(req: Request) {
  const { session, error } = await requireRole(["MANAGER"]);
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  let competitionId = d.competitionId || null;
  if (!competitionId && d.newCompetitionName && d.newCompetitionName.trim()) {
    const name = d.newCompetitionName.trim();
    const existing = await prisma.competition.findFirst({ where: { name } });
    competitionId = existing ? existing.id : (await prisma.competition.create({ data: { name } })).id;
  }

  const match = await prisma.match.create({
    data: {
      opponent: d.opponent,
      date: new Date(d.date),
      competitionId,
      matchdayLabel: d.matchdayLabel || null,
      homeAway: d.homeAway,
      streamUrl: d.streamUrl || null,
      notes: d.notes || null,
      status: d.status ?? "SCHEDULED",
      createdById: session!.user.id,
    },
  });

  await notifyTeam({
    type: "MATCHDAY_CREATED",
    title: "Neuer Spieltag wurde erstellt",
    message: `Spiel gegen ${match.opponent} am ${new Date(match.date).toLocaleDateString("de-DE")} wurde angelegt.`,
    link: `/spielplan/${match.id}`,
  });

  // Discord-Webhook: Ankündigung posten, falls konfiguriert. Fehler dürfen das Anlegen des
  // Spieltags nicht verhindern — daher bewusst "fire and forget" mit try/catch.
  try {
    await sendWebhookAnnouncement({
      title: `📅 Neuer Spieltag: vs. ${match.opponent}`,
      description: `${formatDateTime(match.date)} · ${HOME_AWAY_LABELS[match.homeAway as "HOME" | "AWAY"]}${
        d.matchdayLabel ? `\n${d.matchdayLabel}` : ""
      }`,
    });
  } catch {
    // still fine: In-App-Benachrichtigung wurde bereits erstellt
  }

  return NextResponse.json({ match }, { status: 201 });
}

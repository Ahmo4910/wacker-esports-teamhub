import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { notifyTeam } from "@/lib/notifications";
import { sendWebhookAnnouncement } from "@/lib/discord";
import { HOME_AWAY, MATCH_STATUS } from "@/lib/constants";
import { matchOutcome } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireSession();
  if (error) return error;

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      competition: true,
      availabilities: { include: { player: { include: { user: true } } } },
      lineup: { include: { slots: { include: { player: { include: { user: true } } } } } },
      tactic: true,
    },
  });
  if (!match) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });
  return NextResponse.json({ match });
}

const managerSchema = z.object({
  opponent: z.string().min(2).optional(),
  date: z.string().optional(),
  competitionId: z.string().nullable().optional(),
  matchdayLabel: z.string().nullable().optional(),
  homeAway: z.enum(HOME_AWAY).optional(),
  streamUrl: z.string().nullable().optional(),
  status: z.enum(MATCH_STATUS).optional(),
  resultOwnScore: z.number().int().min(0).nullable().optional(),
  resultOpponentScore: z.number().int().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});

const captainSchema = z.object({
  notes: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const role = session!.user.role;
  if (role !== "MANAGER" && role !== "CAPTAIN") {
    return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  }

  const existing = await prisma.match.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });

  const json = await req.json().catch(() => null);
  const schema = role === "MANAGER" ? managerSchema : captainSchema;
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d: any = { ...parsed.data };
  if (d.date) d.date = new Date(d.date);

  const resultJustEntered =
    role === "MANAGER" &&
    (d.resultOwnScore !== undefined || d.resultOpponentScore !== undefined) &&
    existing.resultOwnScore == null;

  const match = await prisma.match.update({
    where: { id: params.id },
    data: { ...d, updatedById: session!.user.id },
  });

  if (resultJustEntered && match.resultOwnScore != null && match.resultOpponentScore != null) {
    const outcome = matchOutcome(match.resultOwnScore, match.resultOpponentScore);
    const outcomeLabel = outcome === "WIN" ? "Sieg" : outcome === "LOSS" ? "Niederlage" : "Unentschieden";
    await notifyTeam({
      type: "RESULT_ENTERED",
      title: "Ergebnis eingetragen",
      message: `${match.resultOwnScore}:${match.resultOpponentScore} gegen ${match.opponent} (${outcomeLabel}).`,
      link: `/spielplan/${match.id}`,
    });

    try {
      const emoji = outcome === "WIN" ? "🏆" : outcome === "LOSS" ? "😔" : "🤝";
      await sendWebhookAnnouncement({
        title: `${emoji} Ergebnis: vs. ${match.opponent}`,
        description: `**${match.resultOwnScore}:${match.resultOpponentScore}** (${outcomeLabel})`,
      });
    } catch {
      // in-app Benachrichtigung wurde bereits erstellt, Discord ist optional
    }
  }

  return NextResponse.json({ match });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireRole(["MANAGER"]);
  if (error) return error;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });

  await prisma.match.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

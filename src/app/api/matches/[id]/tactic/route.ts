import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { notifyTeam } from "@/lib/notifications";
import { sendWebhookAnnouncement } from "@/lib/discord";
import {
  FORMATIONS,
  TACTIC_PRESSING,
  TACTIC_PRESSING_LABELS,
  TACTIC_STYLE,
  TACTIC_STYLE_LABELS,
  TACTIC_TEMPO,
  TACTIC_TEMPO_LABELS,
} from "@/lib/constants";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await requireSession();
  if (error) return error;
  const tactic = await prisma.tactic.findUnique({ where: { matchId: params.id } });
  return NextResponse.json({ tactic });
}

const putSchema = z.object({
  formation: z.enum(FORMATIONS),
  style: z.enum(TACTIC_STYLE),
  pressing: z.enum(TACTIC_PRESSING),
  tempo: z.enum(TACTIC_TEMPO),
  instructions: z.string().max(3000).optional().nullable(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "Spiel nicht gefunden." }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const existing = await prisma.tactic.findUnique({ where: { matchId: params.id } });

  const tactic = await prisma.tactic.upsert({
    where: { matchId: params.id },
    update: { ...d, updatedById: session!.user.id },
    create: { matchId: params.id, ...d, updatedById: session!.user.id },
  });

  await notifyTeam({
    type: "TACTIC_UPDATED",
    title: "Die Taktik wurde aktualisiert",
    message: `${session!.user.name} hat die Taktik für das Spiel gegen ${match.opponent} ${
      existing ? "angepasst" : "festgelegt"
    } (${d.formation}, ${d.style === "OFFENSIVE" ? "offensiv" : d.style === "DEFENSIVE" ? "defensiv" : "ausgeglichen"}).`,
    link: `/taktik/${match.id}`,
    excludeUserId: session!.user.id,
  });

  try {
    await sendWebhookAnnouncement({
      title: `🎯 Taktik aktualisiert: vs. ${match.opponent}`,
      fields: [
        { name: "Formation", value: d.formation, inline: true },
        { name: "Spielweise", value: TACTIC_STYLE_LABELS[d.style], inline: true },
        { name: "Pressing", value: TACTIC_PRESSING_LABELS[d.pressing], inline: true },
        { name: "Tempo", value: TACTIC_TEMPO_LABELS[d.tempo], inline: true },
      ],
    });
  } catch {
    // in-app Benachrichtigung wurde bereits erstellt, Discord ist optional
  }

  return NextResponse.json({ tactic });
}

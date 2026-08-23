import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/apiAuth";
import { notifyTeam } from "@/lib/notifications";
import { sendWebhookAnnouncement } from "@/lib/discord";
import { formatDateTime } from "@/lib/utils";

export async function GET(req: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope"); // "upcoming" | "past" | null (=all)
  const now = new Date();

  const where =
    scope === "upcoming"
      ? { date: { gte: now } }
      : scope === "past"
      ? { date: { lt: now } }
      : {};

  const trainings = await prisma.training.findMany({
    where,
    orderBy: { date: scope === "past" ? "desc" : "asc" },
    include: { availabilities: true },
  });

  return NextResponse.json({ trainings });
}

const createSchema = z.object({
  date: z.string(), // ISO datetime-local string
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const { session, error } = await requireRole(["CAPTAIN", "MANAGER"]);
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const training = await prisma.training.create({
    data: {
      date: new Date(d.date),
      location: d.location || null,
      notes: d.notes || null,
      createdById: session!.user.id,
    },
  });

  await notifyTeam({
    type: "TRAINING_CREATED",
    title: "Neuer Trainingstermin",
    message: `Training am ${formatDateTime(training.date)}${training.location ? ` · ${training.location}` : ""} wurde angelegt.`,
    link: `/training/${training.id}`,
  });

  // Discord-Webhook: Ankündigung posten, falls konfiguriert. Fehler dürfen das Anlegen
  // nicht verhindern — daher bewusst "fire and forget" mit try/catch.
  try {
    await sendWebhookAnnouncement({
      title: "🏋️ Neuer Trainingstermin",
      description: [
        `**${formatDateTime(training.date)}**`,
        training.location ? `📍 ${training.location}` : null,
        training.notes ? training.notes : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch {
    // still fine: In-App-Benachrichtigung wurde bereits erstellt
  }

  return NextResponse.json({ training }, { status: 201 });
}

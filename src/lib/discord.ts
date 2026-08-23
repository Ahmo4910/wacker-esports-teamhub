import nacl from "tweetnacl";

/**
 * Discord-Integration.
 *
 * Alle Funktionen hier sind bewusst "fail-soft": Ist Discord nicht konfiguriert
 * (fehlende Umgebungsvariablen), passiert einfach nichts bzw. wird ein klarer
 * Fehler zurückgegeben — der Rest der App funktioniert davon völlig unabhängig.
 *
 * Setup-Anleitung: siehe README.md → "Discord-Integration".
 */

const WACKER_COLOR = 0xd3242a;

export function isWebhookConfigured() {
  return !!process.env.DISCORD_WEBHOOK_URL;
}

export function isBotConfigured() {
  return !!(
    process.env.DISCORD_BOT_TOKEN &&
    process.env.DISCORD_APPLICATION_ID &&
    process.env.DISCORD_PUBLIC_KEY &&
    process.env.DISCORD_CHANNEL_ID
  );
}

type Embed = {
  title: string;
  description?: string;
  url?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  color?: number;
  footer?: { text: string };
  timestamp?: string;
};

/** Postet eine einfache Ankündigung über den Incoming-Webhook (keine Buttons, keine Rückmeldung nötig). */
export async function sendWebhookAnnouncement(embed: Embed) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return { skipped: true as const };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Wacker eSports Team-Hub",
      embeds: [{ color: WACKER_COLOR, ...embed }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Discord-Webhook fehlgeschlagen (${res.status}): ${text}`);
  }
  return { skipped: false as const };
}

/**
 * Postet eine Spieltag-Ankündigung mit Zusage-/Absage-Buttons über die Bot-REST-API
 * in den konfigurierten Kanal. Erfordert DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID.
 * Gibt die Discord-Message-ID zurück (wird am Match gespeichert).
 */
export async function postMatchAnnouncementWithButtons(params: {
  matchId: string;
  opponent: string;
  competition?: string | null;
  matchdayLabel?: string | null;
  dateLabel: string;
  homeAway: "Heim" | "Auswärts";
  appUrl: string;
}) {
  if (!isBotConfigured()) {
    throw new Error(
      "Discord-Bot ist nicht konfiguriert. Bitte DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY und DISCORD_CHANNEL_ID setzen (siehe README)."
    );
  }

  const channelId = process.env.DISCORD_CHANNEL_ID!;
  const body = {
    embeds: [
      {
        color: WACKER_COLOR,
        title: `⚽ Neuer Spieltag: vs. ${params.opponent}`,
        description: [
          params.competition ? `🏆 ${params.competition}${params.matchdayLabel ? " · " + params.matchdayLabel : ""}` : null,
          `📅 ${params.dateLabel}`,
          `📍 ${params.homeAway}`,
        ]
          .filter(Boolean)
          .join("\n"),
        url: `${params.appUrl}/spielplan/${params.matchId}`,
        footer: { text: "Bitte bis spätestens einen Tag vorher zu-/absagen." },
      },
    ],
    components: [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 3, // Success (grün)
            label: "Zusage",
            emoji: { name: "✅" },
            custom_id: `rsvp:accept:${params.matchId}`,
          },
          {
            type: 2,
            style: 4, // Danger (rot)
            label: "Absage",
            emoji: { name: "❌" },
            custom_id: `rsvp:decline:${params.matchId}`,
          },
        ],
      },
    ],
  };

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Discord-Bot-Nachricht fehlgeschlagen (${res.status}): ${text}`);
  }

  const message = await res.json();
  return { messageId: message.id as string, channelId };
}

/**
 * Postet eine Trainings-Ankündigung mit Zusage-/Absage-Buttons über die Bot-REST-API
 * in den konfigurierten Kanal. Erfordert DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID.
 * Gibt die Discord-Message-ID zurück (wird am Training gespeichert).
 */
export async function postTrainingAnnouncementWithButtons(params: {
  trainingId: string;
  dateLabel: string;
  location?: string | null;
  notes?: string | null;
  appUrl: string;
}) {
  if (!isBotConfigured()) {
    throw new Error(
      "Discord-Bot ist nicht konfiguriert. Bitte DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY und DISCORD_CHANNEL_ID setzen (siehe README)."
    );
  }

  const channelId = process.env.DISCORD_CHANNEL_ID!;
  const body = {
    embeds: [
      {
        color: WACKER_COLOR,
        title: "🏋️ Neuer Trainingstermin",
        description: [
          `📅 ${params.dateLabel}`,
          params.location ? `📍 ${params.location}` : null,
          params.notes ? params.notes : null,
        ]
          .filter(Boolean)
          .join("\n"),
        url: `${params.appUrl}/training/${params.trainingId}`,
        footer: { text: "Bitte bis spätestens einen Tag vorher zu-/absagen." },
      },
    ],
    components: [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 3, // Success (grün)
            label: "Zusage",
            emoji: { name: "✅" },
            custom_id: `training-rsvp:accept:${params.trainingId}`,
          },
          {
            type: 2,
            style: 4, // Danger (rot)
            label: "Absage",
            emoji: { name: "❌" },
            custom_id: `training-rsvp:decline:${params.trainingId}`,
          },
        ],
      },
    ],
  };

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Discord-Bot-Nachricht fehlgeschlagen (${res.status}): ${text}`);
  }

  const message = await res.json();
  return { messageId: message.id as string, channelId };
}

/** Verifiziert die Ed25519-Signatur eines eingehenden Discord-Interaction-Requests. */
export function verifyDiscordRequest(rawBody: string, signature: string | null, timestamp: string | null) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey || !signature || !timestamp) return false;

  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, "hex"),
      Buffer.from(publicKey, "hex")
    );
  } catch {
    return false;
  }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";

export function TrainingDiscordAnnounceButton({
  trainingId,
  alreadyAnnounced,
}: {
  trainingId: string;
  alreadyAnnounced: boolean;
}) {
  const router = useRouter();
  const [posting, setPosting] = useState(false);
  const [announced, setAnnounced] = useState(alreadyAnnounced);
  const [error, setError] = useState<string | null>(null);

  async function announce() {
    setPosting(true);
    setError(null);
    const res = await fetch(`/api/trainings/${trainingId}/discord-announce`, { method: "POST" });
    setPosting(false);
    if (res.ok) {
      setAnnounced(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "In Discord ankündigen fehlgeschlagen.");
    }
  }

  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5" /> Discord
      </label>
      <button onClick={announce} disabled={posting} className="btn-secondary btn-sm">
        {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
        {announced ? "Erneut in Discord ankündigen" : "In Discord ankündigen"}
      </button>
      {announced && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Mit Zusage-/Absage-Buttons gepostet
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

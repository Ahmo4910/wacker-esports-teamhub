"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrainingRsvpButtons({
  trainingId,
  initialStatus,
  initialReason,
  compact = false,
}: {
  trainingId: string;
  initialStatus: "ACCEPTED" | "DECLINED" | "PENDING";
  initialReason?: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState(initialReason ?? "");
  const [loading, setLoading] = useState(false);

  async function respond(newStatus: "ACCEPTED" | "DECLINED", withReason?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/trainings/${trainingId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason: withReason }),
      });
      if (res.ok) {
        setStatus(newStatus);
        setShowReason(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex gap-2", compact ? "flex-row" : "flex-col sm:flex-row")}>
        <button
          disabled={loading}
          onClick={() => respond("ACCEPTED")}
          className={cn(
            "btn flex-1",
            status === "ACCEPTED" ? "btn-success" : "btn-secondary hover:bg-emerald-500/10 hover:text-emerald-400"
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Zusage
        </button>
        <button
          disabled={loading}
          onClick={() => (status === "DECLINED" ? respond("DECLINED") : setShowReason(true))}
          className={cn(
            "btn flex-1",
            status === "DECLINED" ? "btn-danger" : "btn-secondary hover:bg-rose-500/10 hover:text-rose-400"
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Absage
        </button>
      </div>

      {showReason && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <label className="label !mb-0">Grund (optional)</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="z.B. beruflich verhindert, krank ..."
            className="input"
          />
          <div className="flex gap-2">
            <button className="btn-danger btn-sm flex-1" onClick={() => respond("DECLINED", reason)} disabled={loading}>
              Absage bestätigen
            </button>
            <button className="btn-ghost btn-sm" onClick={() => setShowReason(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

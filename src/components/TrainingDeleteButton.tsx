"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export function TrainingDeleteButton({ trainingId }: { trainingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Diesen Trainingstermin wirklich löschen? Alle Zu-/Absagen gehen dabei verloren.")) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/trainings/${trainingId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/training");
      router.refresh();
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-ghost btn-sm text-rose-400 hover:bg-rose-500/10">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Löschen
    </button>
  );
}

import Link from "next/link";
import { formatDateTime, relativeDay } from "@/lib/utils";
import { MapPin, Users2, Dumbbell } from "lucide-react";

type TrainingLike = {
  id: string;
  date: Date | string;
  location?: string | null;
  notes?: string | null;
  availabilities?: { status: string }[];
};

export function TrainingCard({ training, href }: { training: TrainingLike; href?: string }) {
  const accepted = training.availabilities?.filter((a) => a.status === "ACCEPTED").length ?? 0;
  const declined = training.availabilities?.filter((a) => a.status === "DECLINED").length ?? 0;

  const content = (
    <div className="card card-hover flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-300">
          <Dumbbell className="h-3.5 w-3.5" />
          Training
        </span>
        {training.availabilities && (
          <span className="badge bg-ink-600 text-ink-100">
            <Users2 className="h-3.5 w-3.5" /> {accepted} zugesagt
            {declined > 0 ? ` · ${declined} abgesagt` : ""}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-white">{relativeDay(training.date)}</p>
          {training.location && (
            <p className="flex items-center gap-1 text-xs text-ink-400">
              <MapPin className="h-3 w-3" />
              {training.location}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{formatDateTime(training.date)}</p>
        </div>
      </div>

      {training.notes && <p className="line-clamp-2 text-xs text-ink-400">{training.notes}</p>}
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}

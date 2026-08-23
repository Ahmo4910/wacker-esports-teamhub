import { Avatar } from "@/components/Avatar";
import { AvailabilityBadge } from "@/components/Badges";

type Row = {
  id: string;
  status: string;
  reason: string | null;
  player: { id: string; gamerTag: string; avatarUrl: string | null };
};

export function AvailabilityTable({ rows }: { rows: Row[] }) {
  const accepted = rows.filter((r) => r.status === "ACCEPTED");
  const declined = rows.filter((r) => r.status === "DECLINED");
  const pending = rows.filter((r) => r.status === "PENDING");
  const ordered = [...accepted, ...declined, ...pending];

  if (rows.length === 0) {
    return <p className="text-sm text-ink-400">Noch keine Rückmeldungen.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="table-modern">
        <thead>
          <tr>
            <th>Spieler</th>
            <th>Status</th>
            <th>Grund</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((r) => (
            <tr key={r.id}>
              <td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.player.gamerTag} src={r.player.avatarUrl} size="sm" />
                  <span className="font-medium text-white">{r.player.gamerTag}</span>
                </div>
              </td>
              <td>
                <AvailabilityBadge status={r.status} />
              </td>
              <td className="text-ink-400">{r.reason ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

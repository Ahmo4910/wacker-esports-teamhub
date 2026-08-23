export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-white sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-300">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 px-6 py-14 text-center">
      <p className="font-medium text-ink-200">{title}</p>
      {subtitle && <p className="text-sm text-ink-400">{subtitle}</p>}
    </div>
  );
}

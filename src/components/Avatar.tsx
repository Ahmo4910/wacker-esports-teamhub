import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PALETTE = [
  "from-rose-500 to-red-700",
  "from-amber-500 to-orange-700",
  "from-emerald-500 to-teal-700",
  "from-sky-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-pink-500 to-fuchsia-700",
];

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-24 w-24 text-3xl",
  }[size];

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className={cn(sizeClasses, "rounded-full object-cover ring-2 ring-white/10", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses,
        `flex items-center justify-center rounded-full bg-gradient-to-br font-display font-bold text-white ring-2 ring-white/10`,
        colorFor(name),
        className
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}

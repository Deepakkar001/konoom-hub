import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const ACCENTS: Record<string, string> = {
  blue: "bg-blue-600",
  gold: "bg-gold-500",
  green: "bg-success-600",
  red: "bg-danger-600",
  navy: "bg-navy-800",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  hint,
  delta,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: keyof typeof ACCENTS;
  hint?: string;
  delta?: { value: string; positive: boolean };
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-5">
      <div className={cn("absolute inset-y-0 left-0 w-1", ACCENTS[accent])} />
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-text-secondary">{label}</p>
        <Icon className="h-4 w-4 text-text-tertiary" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-text-primary">
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "text-xs font-medium",
              delta.positive ? "text-success-600" : "text-danger-600",
            )}
          >
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-text-tertiary">{hint}</span>}
      </div>
    </div>
  );
}

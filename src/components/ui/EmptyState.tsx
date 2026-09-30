import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken">
        <Icon className="h-5 w-5 text-text-tertiary" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-[13px] text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

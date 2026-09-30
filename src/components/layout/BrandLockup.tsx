import { BrandLogo } from "@/components/feature/BrandLogo";
import { cn } from "@/lib/cn";

export function BrandLockup({
  compact = false,
  stacked = false,
}: {
  compact?: boolean;
  dark?: boolean;
  stacked?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex",
        stacked ? "h-full w-full flex-col items-center justify-center" : "items-center",
        !stacked && (compact ? "gap-2" : "gap-3"),
      )}
    >
      <div className={cn("flex items-center", stacked ? "h-18 w-full" : "gap-2")}>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
            stacked ? "h-full min-w-0 flex-1 pt-1" : compact ? "h-8 w-26" : "h-10 w-32.5",
          )}
        >
          <BrandLogo priority />
        </div>
      </div>
    </div>
  );
}
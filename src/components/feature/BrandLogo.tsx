import Image from "next/image";
import { LOGO_ALT, LOGO_SRC } from "@/lib/app-info";
import { cn } from "@/lib/cn";

// Single place that renders the product logo. Change LOGO_SRC in
// lib/app-info.ts to swap the asset everywhere it's used.
export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={256}
      height={64}
      priority={priority}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}

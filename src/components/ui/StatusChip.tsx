"use client";

import { cn } from "@/lib/cn";
import { translateKnown } from "@/lib/i18n/labels";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { PartnerStatus, TransactionStatus, WebUserStatus } from "@/lib/types";

type AnyStatus = TransactionStatus | PartnerStatus | WebUserStatus | string;

const STYLES: Record<string, string> = {
  COMPLETED: "bg-success-100 text-success-600",
  active: "bg-success-100 text-success-600",
  online: "bg-success-100 text-success-600",
  Settled: "bg-success-100 text-success-600",

  PENDING: "bg-warning-100 text-warning-600",
  pending: "bg-warning-100 text-warning-600",
  invited: "bg-warning-100 text-warning-600",
  degraded: "bg-warning-100 text-warning-600",
  RECIPIENT_CREDIT_PENDING: "bg-warning-100 text-warning-600",
  AUTHORIZED: "bg-info-100 text-info-600",
  SENDER_DEBITED: "bg-info-100 text-info-600",
  VALIDATING: "bg-info-100 text-info-600",
  INITIATED: "bg-info-100 text-info-600",

  FAILED: "bg-danger-100 text-danger-600",
  REJECTED: "bg-danger-100 text-danger-600",
  TIMEOUT: "bg-danger-100 text-danger-600",
  suspended: "bg-danger-100 text-danger-600",
  disabled: "bg-danger-100 text-danger-600",
  offline: "bg-danger-100 text-danger-600",

  CANCELLED: "bg-surface-sunken text-text-secondary",
  REFUNDED: "bg-navy-100 text-navy-800",
  inactive: "bg-surface-sunken text-text-secondary",
  Excluded: "bg-surface-sunken text-text-secondary",
};

export function StatusChip({ status }: { status: AnyStatus }) {
  const { t } = useI18n();
  const style = STYLES[status] ?? "bg-surface-sunken text-text-secondary";
  const label = translateKnown(t, status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        style,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

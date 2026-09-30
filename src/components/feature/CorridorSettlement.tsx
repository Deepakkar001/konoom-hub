"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { transactionService } from "@/lib/services";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import { useDataRevision } from "@/lib/use-data-revision";
import type { Corridor, Transaction } from "@/lib/types";

export function CorridorSettlement({ corridor }: { corridor: Corridor }) {
  const { t } = useI18n();
  const dataRevision = useDataRevision();
  const [txns, setTxns] = useState<Transaction[] | null>(null);

  useEffect(() => {
    setTxns(null);
    transactionService
      .searchTransactions({ corridorId: corridor.id, page: 1, pageSize: 200 })
      .then((r) => setTxns(r.items));
  }, [corridor.id, dataRevision]);

  const pending = txns?.filter((txn) => txn.settlementStatus === "Pending") ?? [];
  const settled = txns?.filter((txn) => txn.settlementStatus === "Settled") ?? [];
  const excluded = txns?.filter((txn) => txn.settlementStatus === "Excluded") ?? [];
  const pendingValue = pending.reduce((sum, txn) => sum + txn.sendingAmount, 0);
  const currency = txns?.[0]?.sendingCurrency ?? "XAF";

  return (
    <Card>
      <CardHeader
        title={t("settle.byCorridor")}
        subtitle={t("settle.byCorridorSub")}
      />
      {!txns ? (
        <TableSkeleton rows={3} cols={3} />
      ) : txns.length === 0 ? (
        <p className="p-6 text-center text-[13.5px] text-text-tertiary">{t("settle.noCorridorTxns")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            <Stat label={t("settle.pendingCount")} value={String(pending.length)} />
            <Stat label={t("settle.settledCount")} value={String(settled.length)} />
            <Stat label={t("settle.excludedCount")} value={String(excluded.length)} />
            <Stat label={t("settle.pendingValue")} value={formatCurrency(pendingValue, currency)} />
          </div>
          <p className="px-5 pb-3 text-[12.5px] text-text-secondary">
            {t("detail.freq", { freq: translateKnown(t, corridor.settlementFrequency) })}
          </p>
          <div className="divide-y divide-border border-t border-border">
            {pending.slice(0, 8).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="font-ref text-[12.5px] font-medium text-text-primary">{txn.id}</p>
                  <p className="text-xs text-text-tertiary">{formatDateTime(txn.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-[13px] font-medium text-text-primary">
                    {formatCurrency(txn.sendingAmount, txn.sendingCurrency)}
                  </span>
                  <StatusChip status={txn.settlementStatus} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-sunken px-3 py-2.5">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-[15px] font-semibold tabular-nums text-text-primary">{value}</p>
    </div>
  );
}

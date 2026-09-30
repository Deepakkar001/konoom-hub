"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, CheckCircle2, AlertTriangle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/feature/StatCard";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { transactionService } from "@/lib/services";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { useDataRevision } from "@/lib/use-data-revision";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function ReconciliationPage() {
  const [txns, setTxns] = useState<Transaction[] | null>(null);
  const dataRevision = useDataRevision();
  const { t } = useI18n();

  useEffect(() => {
    transactionService.searchTransactions({ pageSize: 100 }).then((r) => setTxns(r.items));
  }, [dataRevision]);

  const completed = txns?.filter((t) => t.status === "COMPLETED") ?? [];
  const matched = completed.filter((t) => t.settlementStatus === "Settled");
  const unmatched = completed.filter((t) => t.settlementStatus === "Pending");
  const matchRate = completed.length ? Math.round((matched.length / completed.length) * 100) : 0;

  return (
    <div>
      <Topbar title={t("recon.title")} subtitle={t("recon.subtitle")} />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label={t("recon.rate")} value={`${matchRate}%`} icon={CheckCircle2} accent="green" hint={t("recon.rateHint")} />
          <StatCard label={t("recon.matched")} value={String(matched.length)} icon={GitCompareArrows} accent="blue" />
          <StatCard label={t("recon.exceptions")} value={String(unmatched.length)} icon={AlertTriangle} accent="gold" hint={t("recon.exceptionHint")} />
        </div>

        <Card>
          <CardHeader title={t("recon.list")} subtitle={t("recon.listSub")} />
          {!txns ? (
            <TableSkeleton rows={5} cols={4} />
          ) : unmatched.length === 0 ? (
            <div className="p-10 text-center text-[13.5px] text-text-tertiary">
              {t("common.noExceptions")}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {unmatched.slice(0, 12).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="font-ref text-[12.5px] font-medium text-text-primary">{t.id}</p>
                    <p className="text-xs text-text-tertiary">
                      {t.sourcePartnerId} → {t.destinationPartnerId} · {formatDateTime(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-[13px] font-medium text-text-primary">
                      {formatCurrency(t.sendingAmount, t.sendingCurrency)}
                    </span>
                    <StatusChip status="Pending" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

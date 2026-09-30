"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar, SearchInput, FilterSelect } from "@/components/feature/FilterBar";
import { Pagination } from "@/components/feature/Pagination";
import { Button } from "@/components/ui/Button";
import { transactionService } from "@/lib/services";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { countryByCode } from "@/lib/mock-data";
import type { PaginatedResult, Transaction, TransactionStatus } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { useDataRevision } from "@/lib/use-data-revision";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";

const STATUSES: TransactionStatus[] = [
  "COMPLETED",
  "PENDING",
  "RECIPIENT_CREDIT_PENDING",
  "FAILED",
  "REJECTED",
  "CANCELLED",
  "REFUNDED",
  "TIMEOUT",
  "AUTHORIZED",
  "SENDER_DEBITED",
];

export function TransactionTable({
  partnerId,
  corridorId,
  basePath,
  showPartnerColumn = false,
}: {
  partnerId?: string;
  corridorId?: string;
  basePath: string;
  showPartnerColumn?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [settlement, setSettlement] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<Transaction> | null>(null);
  const { push } = useToast();
  const { t } = useI18n();
  const pageSize = 8;
  const dataRevision = useDataRevision();

  useEffect(() => {
    setResult(null);
    transactionService
      .searchTransactions({
        partnerId,
        corridorId: corridorId || undefined,
        query: query || undefined,
        status: (status as TransactionStatus) || undefined,
        settlementStatus: (settlement as Transaction["settlementStatus"]) || undefined,
        page,
        pageSize,
      })
      .then(setResult);
  }, [partnerId, corridorId, query, status, settlement, page, dataRevision]);

  useEffect(() => setPage(1), [query, status, settlement]);

  return (
    <Card>
      <FilterBar>
        <SearchInput value={query} onChange={setQuery} placeholder={t("tx.search")} />
        <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-52">
          <option value="">{t("common.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{translateKnown(t, s)}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={settlement} onChange={(e) => setSettlement(e.target.value)} className="w-44">
          <option value="">{t("common.allSettlement")}</option>
          <option value="Settled">{translateKnown(t, "Settled")}</option>
          <option value="Pending">{translateKnown(t, "Pending")}</option>
          <option value="Excluded">{translateKnown(t, "Excluded")}</option>
        </FilterSelect>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => push("info", t("tx.exportQueued"))}
        >
          <Download className="h-3.5 w-3.5" /> {t("common.export")}
        </Button>
      </FilterBar>

      {!result ? (
        <TableSkeleton rows={8} cols={6} />
      ) : result.items.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title={t("tx.empty")} description={t("tx.emptyBody")} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="border-b border-border text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
                  <th className="px-5 py-3">{t("tx.col.txn")}</th>
                  <th className="px-5 py-3">{t("tx.col.route")}</th>
                  {showPartnerColumn && <th className="px-5 py-3">{t("tx.col.partner")}</th>}
                  <th className="px-5 py-3 text-end">{t("tx.col.amount")}</th>
                  <th className="px-5 py-3">{t("tx.col.status")}</th>
                  <th className="px-5 py-3">{t("tx.col.settlement")}</th>
                  <th className="px-5 py-3">{t("tx.col.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.items.map((t) => (
                  <tr key={t.id} className="text-[13.5px] hover:bg-surface-sunken">
                    <td className="px-5 py-3.5">
                      <Link href={`${basePath}/${t.id}`} className="block">
                        <p className="font-ref text-[12.5px] font-medium text-text-primary hover:text-blue-600">
                          {t.id}
                        </p>
                        <p className="text-xs text-text-tertiary">{t.hubReference}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">
                      {countryByCode(t.senderCountry).flag} → {countryByCode(t.recipientCountry).flag}
                    </td>
                    {showPartnerColumn && (
                      <td className="px-5 py-3.5 text-text-secondary">{t.sourcePartnerId}</td>
                    )}
                    <td className="px-5 py-3.5 text-end tabular-nums font-medium text-text-primary">
                      {formatCurrency(t.sendingAmount, t.sendingCurrency)}
                    </td>
                    <td className="px-5 py-3.5"><StatusChip status={t.status} /></td>
                    <td className="px-5 py-3.5"><StatusChip status={t.settlementStatus} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-text-secondary">{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPageChange={setPage} />
        </>
      )}
    </Card>
  );
}

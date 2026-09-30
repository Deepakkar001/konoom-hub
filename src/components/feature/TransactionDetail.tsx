"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Circle, XCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { transactionService } from "@/lib/services";
import { useDataRevision } from "@/lib/use-data-revision";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { countryByCode } from "@/lib/mock-data";
import { countryDisplayName } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { Transaction } from "@/lib/types";

export function TransactionDetail({ backHref }: { backHref: string }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [txn, setTxn] = useState<Transaction | null | undefined>(undefined);
  const dataRevision = useDataRevision();
  const { t } = useI18n();

  useEffect(() => {
    transactionService.getTransaction(id).then((t) => setTxn(t ?? null));
  }, [id, dataRevision]);

  if (txn === undefined) {
    return (
      <div>
        <Topbar title={t("common.loadingTxn")} />
        <div className="p-6"><TableSkeleton rows={5} cols={3} /></div>
      </div>
    );
  }
  if (txn === null) {
    return (
      <div>
        <Topbar title={t("common.txnNotFound")} />
        <div className="p-6">
          <button onClick={() => router.push(backHref)} className="text-sm text-blue-600 hover:underline">
            {t("common.backToTransactions")}
          </button>
        </div>
      </div>
    );
  }

  const isFailureLike = ["FAILED", "REJECTED", "TIMEOUT", "CANCELLED"].includes(txn.status);
  const sender = countryByCode(txn.senderCountry);
  const recipient = countryByCode(txn.recipientCountry);

  return (
    <div>
      <Topbar title={t("tx.detail")} subtitle={txn.id} />
      <div className="p-6">
        <button
          onClick={() => router.push(backHref)}
          className="mb-4 flex items-center gap-1 text-[13px] font-medium text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:-scale-x-100" /> {t("common.backToTransactions")}
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-ref text-lg font-semibold text-text-primary">{txn.id}</h2>
              <StatusChip status={txn.status} />
            </div>
            <p className="mt-1 text-[13px] text-text-secondary">
              {sender.flag} {countryDisplayName(sender.code)} → {recipient.flag} {countryDisplayName(recipient.code)} · {formatDateTime(txn.createdAt)}
            </p>
          </div>
          <StatusChip status={txn.settlementStatus} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-5">
              <h4 className="mb-4 text-[13.5px] font-semibold text-text-primary">{t("tx.amount")}</h4>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Amount label={t("tx.sending")} value={formatCurrency(txn.sendingAmount, txn.sendingCurrency)} />
                <Amount label={t("tx.charge")} value={formatCurrency(txn.serviceCharge, txn.sendingCurrency)} />
                <Amount label={t("tx.tax")} value={formatCurrency(txn.tax, txn.sendingCurrency)} />
                <Amount label={t("tx.debited")} value={formatCurrency(txn.totalDebited, txn.sendingCurrency)} highlight />
                <Amount label={t("tx.fx")} value={`1 : ${txn.fxRate}`} />
                <Amount label={t("tx.receiving")} value={formatCurrency(txn.receivingAmount, txn.receivingCurrency)} highlight />
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="mb-4 text-[13.5px] font-semibold text-text-primary">{t("tx.timeline")}</h4>
              <div className="space-y-0">
                {txn.timeline.map((step, i) => {
                  const isLast = i === txn.timeline.length - 1;
                  const failed = isFailureLike && isLast;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {failed ? (
                          <XCircle className="h-4.5 w-4.5 text-danger-600" />
                        ) : (
                          <CheckCircle2 className="h-4.5 w-4.5 text-success-600" />
                        )}
                        {!isLast && <div className="my-0.5 h-8 w-px bg-border-strong" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-[13.5px] font-medium text-text-primary">{translateKnown(t, step.label)}</p>
                        <p className="text-xs text-text-tertiary">{formatDateTime(step.timestamp)}</p>
                        {step.note && (
                          <p className="mt-1 max-w-md text-[12.5px] text-text-secondary">{step.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!isFailureLike && txn.status !== "COMPLETED" && (
                  <div className="flex gap-3">
                    <Circle className="h-4.5 w-4.5 text-text-tertiary" />
                    <p className="text-[13.5px] text-text-tertiary">{t("common.awaitingNext")}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h4 className="mb-3 text-[13.5px] font-semibold text-text-primary">{t("tx.parties")}</h4>
              <dl className="space-y-2.5 text-[13px]">
                <Row label={t("tx.senderWallet")} value={txn.senderMobileMasked} mono />
                <Row label={t("tx.senderCountry")} value={`${sender.flag} ${countryDisplayName(sender.code)}`} />
                <Row label={t("tx.recipientWallet")} value={txn.recipientMobileMasked} mono />
                <Row label={t("tx.recipientCountry")} value={`${recipient.flag} ${countryDisplayName(recipient.code)}`} />
              </dl>
            </Card>
            <Card className="p-5">
              <h4 className="mb-3 text-[13.5px] font-semibold text-text-primary">{t("tx.refs")}</h4>
              <dl className="space-y-2.5 text-[13px]">
                <Row label={t("tx.hubRef")} value={txn.hubReference} mono />
                <Row label={t("tx.partnerRef")} value={txn.partnerReference} mono />
                {txn.settlementReference && (
                  <Row label={t("tx.settleRef")} value={txn.settlementReference} mono />
                )}
                <Row label={t("tx.source")} value={txn.sourcePartnerId} mono />
                <Row label={t("tx.destination")} value={txn.destinationPartnerId} mono />
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Amount({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className={`tabular-nums text-[14px] font-semibold ${highlight ? "text-blue-600" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={`text-end font-medium text-text-primary ${mono ? "font-ref" : ""}`}>{value}</dd>
    </div>
  );
}

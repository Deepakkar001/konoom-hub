"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { TransactionTable } from "@/components/feature/TransactionTable";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function HubTransactionsPage() {
  return (
    <Suspense>
      <HubTransactions />
    </Suspense>
  );
}

function HubTransactions() {
  const { t } = useI18n();
  const corridorId = useSearchParams().get("corridor") ?? undefined;
  return (
    <div>
      <Topbar title={t("tx.title")} subtitle={t("tx.hubSubtitle")} />
      <div className="space-y-3 p-6">
        {corridorId && (
          <p className="text-[13px] text-text-secondary">
            {t("corridors.filtered", { id: corridorId })}{" "}
            <Link href="/hub/transactions" className="font-medium text-blue-600 hover:underline">
              {t("corridors.clearFilter")}
            </Link>
          </p>
        )}
        <TransactionTable corridorId={corridorId} basePath="/hub/transactions" showPartnerColumn />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Banknote,
  Clock,
  Landmark,
  Wallet,
  Waypoints,
  ArrowUpRight,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/feature/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { TrendChart } from "@/components/charts/TrendChart";
import { useAuth } from "@/lib/auth-context";
import { dashboardService, transactionService, partnerService } from "@/lib/services";
import { countryDisplayName, formatCompact, formatCurrency, formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { Partner, PartnerDashboardStats, Transaction } from "@/lib/types";
import { useDataRevision } from "@/lib/use-data-revision";

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PartnerDashboardStats | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[] | null>(null);
  const dataRevision = useDataRevision();
  const { t } = useI18n();

  useEffect(() => {
    if (!user?.partnerId) return;
    dashboardService.getPartnerDashboardStats(user.partnerId).then(setStats);
    partnerService.getPartner(user.partnerId).then((p) => setPartner(p ?? null));
    transactionService
      .searchTransactions({ partnerId: user.partnerId, page: 1, pageSize: 6 })
      .then((r) => setRecentTxns(r.items));
  }, [user?.partnerId, dataRevision]);

  return (
    <div>
      <Topbar
        title={t("pdash.title")}
        subtitle={partner ? `${partner.name} · ${countryDisplayName(partner.country)}` : t("common.loadingPartner")}
      />

      <div className="space-y-6 p-6">
        {partner && partner.status !== "active" && (
          <div className="rounded-lg border border-warning-100 bg-warning-100/60 px-4 py-3 text-[13px] text-warning-600">
            {t("pdash.restricted", { status: translateKnown(t, partner.status) })}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label={t("dash.value")} value={formatCurrency(stats.totalRemittanceValue)} icon={Banknote} accent="blue" />
              <StatCard label={t("dash.txns")} value={formatCompact(stats.totalTransactions)} icon={ArrowLeftRight} accent="navy" hint={t("common.todayCount", { count: stats.todaysTransactions })} />
              <StatCard label={t("dash.outstanding")} value={formatCurrency(stats.outstandingSettlement)} icon={Landmark} accent="gold" />
              <StatCard label={t("dash.liquidity")} value={formatCurrency(stats.availableLiquidity)} icon={Wallet} accent="green" />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <MiniStat icon={CheckCircle2} label={t("dash.success")} value={stats.successfulTransactions} tone="success" />
              <MiniStat icon={XCircle} label={t("dash.failed")} value={stats.failedTransactions} tone="danger" />
              <MiniStat icon={Clock} label={t("dash.pending")} value={stats.pendingTransactions} />
              <MiniStat icon={Waypoints} label={t("dash.corridors")} value={stats.activeCorridors} />
            </>
          )}
        </div>

        <Card>
          <CardHeader title={t("dash.volume")} subtitle={t("pdash.volumeSub")} />
          <div className="p-5">
            {stats ? <TrendChart data={stats.trend} /> : <div className="h-64 animate-pulse rounded-lg bg-surface-sunken" />}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t("dash.recent")}
            subtitle={t("pdash.recentSub")}
            action={
              <Link href="/partner/transactions" className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:underline">
                {t("common.viewAll")} <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
              </Link>
            }
          />
          {!recentTxns ? (
            <TableSkeleton rows={6} cols={4} />
          ) : (
            <div className="divide-y divide-border">
              {recentTxns.map((t) => (
                <Link key={t.id} href={`/partner/transactions/${t.id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-surface-sunken">
                  <div className="min-w-0">
                    <p className="font-ref truncate text-[12.5px] font-medium text-text-primary">{t.id}</p>
                    <p className="text-xs text-text-tertiary">
                      {t.senderCountry} → {t.recipientCountry} · {formatDateTime(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-[13px] font-medium text-text-primary">
                      {formatCurrency(t.sendingAmount, t.sendingCurrency)}
                    </span>
                    <StatusChip status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "success" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Icon className={"h-4 w-4 " + (tone === "success" ? "text-success-600" : tone === "danger" ? "text-danger-600" : "text-text-tertiary")} />
      <p className="mt-2 text-lg font-semibold tabular-nums text-text-primary">{formatCompact(value)}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}

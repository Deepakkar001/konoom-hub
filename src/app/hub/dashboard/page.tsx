"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Banknote,
  Clock,
  Landmark,
  Wallet,
  Waypoints,
  Users,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/feature/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { TrendChart } from "@/components/charts/TrendChart";
import { CorridorBarChart } from "@/components/charts/CorridorBarChart";
import { dashboardService, partnerService, transactionService } from "@/lib/services";
import { formatCompact, formatCurrency, formatDateTime } from "@/lib/format";
import { countryByCode, CORRIDORS } from "@/lib/mock-data";
import { useDataRevision } from "@/lib/use-data-revision";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { HubDashboardStats, Partner, Transaction } from "@/lib/types";

export default function HubDashboardPage() {
  const [stats, setStats] = useState<HubDashboardStats | null>(null);
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[] | null>(null);
  const dataRevision = useDataRevision();
  const { t } = useI18n();

  useEffect(() => {
    dashboardService.getHubDashboardStats().then(setStats);
    partnerService.listPartners().then(setPartners);
    transactionService
      .searchTransactions({ page: 1, pageSize: 6 })
      .then((r) => setRecentTxns(r.items));
  }, [dataRevision]);

  // Deterministic corridor volumes (avoids Math.random hydration issues)
  const corridorVolumes = CORRIDORS.map((c, i) => ({
    name: `${c.fromCountry} → ${c.toCountry}`,
    value: [4820, 2140, 640][i] ?? 500,
  }));

  return (
    <div>
      <Topbar
        title={t("dash.title")}
        subtitle={t("dash.subtitle")}
      />

      <div className="space-y-6 p-6">
        {/* Primary KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!stats ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label={t("dash.value")}
                value={formatCurrency(stats.totalRemittanceValue, "XAF")}
                icon={Banknote}
                accent="blue"
                hint={t("dash.across")}
              />
              <StatCard
                label={t("dash.txns")}
                value={formatCompact(stats.totalTransactions)}
                icon={ArrowLeftRight}
                accent="navy"
                delta={{ value: "4.2%", positive: true }}
                hint={t("dash.vs")}
              />
              <StatCard
                label={t("dash.outstanding")}
                value={formatCurrency(stats.outstandingSettlement, "XAF")}
                icon={Landmark}
                accent="gold"
                hint={t("dash.payout")}
              />
              <StatCard
                label={t("dash.liquidity")}
                value={formatCurrency(stats.availableLiquidity, "XAF")}
                icon={Wallet}
                accent="green"
                hint={t("dash.trust")}
              />
            </>
          )}
        </div>

        {/* Secondary KPI strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {!stats ? (
            Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : (
            <>
              <MiniStat icon={Building2} label={t("dash.partners")} value={stats.partnerCount} />
              <MiniStat
                icon={Clock}
                label={t("dash.today")}
                value={stats.todaysTransactions}
              />
              <MiniStat
                icon={CheckCircle2}
                label={t("dash.success")}
                value={stats.successfulTransactions}
                tone="success"
              />
              <MiniStat
                icon={XCircle}
                label={t("dash.failed")}
                value={stats.failedTransactions}
                tone="danger"
              />
              <MiniStat
                icon={Waypoints}
                label={t("dash.corridors")}
                value={stats.activeCorridors}
              />
              <MiniStat icon={Users} label={t("dash.users")} value={stats.webUserCount} />
            </>
          )}
        </div>

        {/* Trend + corridor volume */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title={t("dash.volume")}
              subtitle={t("dash.volumeSub")}
            />
            <div className="p-5">
              {stats ? (
                <TrendChart data={stats.trend} />
              ) : (
                <div className="h-64 animate-pulse rounded-lg bg-surface-sunken" />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={t("dash.byCorridor")} subtitle={t("dash.last30")} />
            <div className="p-5">
              <CorridorBarChart data={corridorVolumes} />
            </div>
          </Card>
        </div>

        {/* Partners + recent transactions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader
              title={t("dash.partners")}
              subtitle={t("common.onboarded", { count: partners?.length ?? "…" })}
              action={
                <Link href="/hub/partners" className="text-[13px] font-medium text-blue-600 hover:underline">
                  {t("common.viewAll")}
                </Link>
              }
            />
            {!partners ? (
              <TableSkeleton rows={5} cols={2} />
            ) : (
              <div className="divide-y divide-border">
                {partners.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/hub/partners/${p.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-sunken"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{countryByCode(p.country).flag}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-text-primary">
                          {p.name}
                        </p>
                        <p className="text-xs text-text-tertiary">{p.id}</p>
                      </div>
                    </div>
                    <StatusChip status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader
              title={t("dash.recent")}
              subtitle={t("dash.recentSub")}
              action={
                <Link
                  href="/hub/transactions"
                  className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:underline"
                >
                  {t("common.viewAll")} <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                </Link>
              }
            />
            {!recentTxns ? (
              <TableSkeleton rows={6} cols={4} />
            ) : (
              <div className="divide-y divide-border">
                {recentTxns.map((t) => (
                  <Link
                    key={t.id}
                    href={`/hub/transactions/${t.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-surface-sunken"
                  >
                    <div className="min-w-0">
                      <p className="font-ref truncate text-[12.5px] font-medium text-text-primary">
                        {t.id}
                      </p>
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
      <Icon
        className={
          "h-4 w-4 " +
          (tone === "success"
            ? "text-success-600"
            : tone === "danger"
              ? "text-danger-600"
              : "text-text-tertiary")
        }
      />
      <p className="mt-2 text-lg font-semibold tabular-nums text-text-primary">
        {formatCompact(value)}
      </p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}

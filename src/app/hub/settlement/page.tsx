"use client";

import { useState } from "react";
import { Landmark, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { StatCard } from "@/components/feature/StatCard";
import { PARTNERS, countryByCode } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import { Wallet, Clock } from "lucide-react";

const NEXT_RUN = "2026-09-30";
const LAST_RUN = "2026-09-25";

export default function SettlementPage() {
  const [settled, setSettled] = useState<Set<string>>(new Set());
  const { push } = useToast();
  const { t } = useI18n();
  const activePartners = PARTNERS.filter((p) => p.status === "active");

  const totalOutstanding = activePartners.reduce((s, p) => s + p.stats.outstandingSettlement, 0);
  const totalLiquidity = activePartners.reduce((s, p) => s + p.stats.availableLiquidity, 0);

  function settle(id: string) {
    setSettled((s) => new Set(s).add(id));
    const p = PARTNERS.find((x) => x.id === id)!;
    push("success", t("settle.started", { name: p.name }));
  }

  return (
    <div>
      <Topbar title={t("settle.title")} subtitle={t("settle.subtitle")} />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label={t("dash.outstanding")} value={formatCurrency(totalOutstanding)} icon={Landmark} accent="gold" />
          <StatCard label={t("settle.trust")} value={formatCurrency(totalLiquidity)} icon={Wallet} accent="green" />
          <StatCard label={t("settle.next")} value={formatDate(NEXT_RUN)} icon={Clock} accent="blue" hint={t("settle.last", { date: formatDate(LAST_RUN) })} />
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="border-b border-border text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
                  <th className="px-5 py-3">{t("partners.col.partner")}</th>
                  <th className="px-5 py-3 text-end">{t("settle.col.outstanding")}</th>
                  <th className="px-5 py-3 text-end">{t("settle.col.liquidity")}</th>
                  <th className="px-5 py-3">{t("settle.col.freq")}</th>
                  <th className="px-5 py-3">{t("partners.col.status")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activePartners.map((p) => {
                  const isSettled = settled.has(p.id) || p.stats.outstandingSettlement === 0;
                  return (
                    <tr key={p.id} className="text-[13.5px] hover:bg-surface-sunken">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-medium text-text-primary">
                          <span>{countryByCode(p.country).flag}</span> {p.name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-end tabular-nums text-text-primary">
                        {formatCurrency(p.stats.outstandingSettlement)}
                      </td>
                      <td className="px-5 py-3.5 text-end tabular-nums text-text-secondary">
                        {formatCurrency(p.stats.availableLiquidity)}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{translateKnown(t, "Daily")}</td>
                      <td className="px-5 py-3.5">
                        <StatusChip status={isSettled ? "Settled" : "Pending"} />
                      </td>
                      <td className="px-5 py-3.5 text-end">
                        {!isSettled && (
                          <Button size="sm" variant="secondary" onClick={() => settle(p.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" /> {t("common.markSettled")}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

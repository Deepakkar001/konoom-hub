"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Building2, MoreVertical, Eye, Ban, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar, SearchInput, FilterSelect } from "@/components/feature/FilterBar";
import { partnerService } from "@/lib/services";
import { countryDisplayName, formatCompact, formatCurrency, formatDate } from "@/lib/format";
import { COUNTRIES, countryByCode } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { Partner, PartnerStatus } from "@/lib/types";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/cn";
import { useDataRevision } from "@/lib/use-data-revision";

export default function PartnerListPage() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const { push } = useToast();
  const { t } = useI18n();
  const dataRevision = useDataRevision();

  const load = () => {
    setPartners(null);
    partnerService
      .listPartners({
        query: query || undefined,
        country: country || undefined,
        status: (status as PartnerStatus) || undefined,
      })
      .then(setPartners);
  };

  useEffect(load, [query, country, status, dataRevision]);

  async function toggleStatus(p: Partner) {
    const next: PartnerStatus = p.status === "active" ? "suspended" : "active";
    await partnerService.setPartnerStatus(p.id, next);
    push("success", t("partners.now", { name: p.name, status: translateKnown(t, next) }));
    setMenuFor(null);
    load();
  }

  const summary = useMemo(() => {
    if (!partners) return null;
    return {
      active: partners.filter((p) => p.status === "active").length,
      pending: partners.filter((p) => p.status === "pending").length,
      suspended: partners.filter((p) => p.status === "suspended").length,
    };
  }, [partners]);

  return (
    <div>
      <Topbar
        title={t("partners.title")}
        subtitle={t("partners.subtitle")}
        actions={
          <Link href="/hub/partners/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> {t("common.registerPartner")}
            </Button>
          </Link>
        }
      />

      <div className="space-y-4 p-6">
        {summary && (
          <div className="grid grid-cols-3 gap-4 sm:max-w-md">
            <SummaryPill label={t("status.partner.active")} value={summary.active} tone="success" />
            <SummaryPill label={t("status.partner.pending")} value={summary.pending} tone="warning" />
            <SummaryPill label={t("status.partner.suspended")} value={summary.suspended} tone="danger" />
          </div>
        )}

        <Card>
          <FilterBar>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t("partners.search")}
            />
            <FilterSelect
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-44"
            >
              <option value="">{t("common.allCountries")}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {countryDisplayName(c.code)}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-40"
            >
              <option value="">{t("common.allStatuses")}</option>
              <option value="active">{t("status.partner.active")}</option>
              <option value="pending">{t("status.partner.pending")}</option>
              <option value="suspended">{t("status.partner.suspended")}</option>
              <option value="inactive">{t("status.partner.inactive")}</option>
            </FilterSelect>
          </FilterBar>

          {!partners ? (
            <TableSkeleton rows={6} cols={6} />
          ) : partners.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t("partners.empty")}
              description={t("partners.emptyBody")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-border text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
                    <th className="px-5 py-3">{t("partners.col.partner")}</th>
                    <th className="px-5 py-3">{t("partners.col.country")}</th>
                    <th className="px-5 py-3">{t("partners.col.type")}</th>
                    <th className="px-5 py-3">{t("partners.col.onboarded")}</th>
                    <th className="px-5 py-3 text-end">{t("partners.col.txns")}</th>
                    <th className="px-5 py-3 text-end">{t("partners.col.value")}</th>
                    <th className="px-5 py-3">{t("partners.col.status")}</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {partners.map((p) => (
                    <tr key={p.id} className="text-[13.5px] hover:bg-surface-sunken">
                      <td className="px-5 py-3.5">
                        <Link href={`/hub/partners/${p.id}`} className="block">
                          <p className="font-medium text-text-primary hover:text-blue-600">
                            {p.name}
                          </p>
                          <p className="text-xs text-text-tertiary">{p.id}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {countryByCode(p.country).flag} {countryDisplayName(p.country)}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{translateKnown(t, p.partnerType)}</td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {formatDate(p.onboardedDate)}
                      </td>
                      <td className="px-5 py-3.5 text-end tabular-nums text-text-primary">
                        {formatCompact(p.stats.totalTransactions)}
                      </td>
                      <td className="px-5 py-3.5 text-end tabular-nums text-text-primary">
                        {formatCurrency(p.stats.totalRemittanceValue, "XAF")}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusChip status={p.status} />
                      </td>
                      <td className="relative px-5 py-3.5 text-end">
                        <button
                          onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                          className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-sunken hover:text-text-primary"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuFor === p.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuFor(null)}
                            />
                            <div className="absolute end-5 z-20 mt-1 w-48 rounded-lg border border-border bg-surface py-1.5 text-start shadow-lg">
                              <Link
                                href={`/hub/partners/${p.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                              >
                                <Eye className="h-3.5 w-3.5" /> {t("common.viewDetails")}
                              </Link>
                              <button
                                onClick={() => toggleStatus(p)}
                                className={cn(
                                  "flex w-full items-center gap-2 px-3 py-2 text-[13px]",
                                  p.status === "active"
                                    ? "text-danger-600 hover:bg-danger-100"
                                    : "text-success-600 hover:bg-success-100",
                                )}
                              >
                                {p.status === "active" ? (
                                  <>
                                    <Ban className="h-3.5 w-3.5" /> {t("common.deactivate")}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" /> {t("common.activate")}
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger";
}) {
  const colors = {
    success: "text-success-600 bg-success-100",
    warning: "text-warning-600 bg-warning-100",
    danger: "text-danger-600 bg-danger-100",
  };
  return (
    <div className={cn("rounded-lg px-4 py-2.5", colors[tone])}>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

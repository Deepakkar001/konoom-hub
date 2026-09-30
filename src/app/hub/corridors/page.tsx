"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Power, Waypoints } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Label, Select } from "@/components/ui/Field";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusChip } from "@/components/ui/StatusChip";
import { corridorService, partnerService } from "@/lib/services";
import { COUNTRIES, countryByCode } from "@/lib/mock-data";
import { useToast } from "@/lib/toast-context";
import type { Corridor, CountryCode, Partner } from "@/lib/types";
import { useDataRevision } from "@/lib/use-data-revision";
import { useI18n } from "@/lib/i18n/i18n-context";
import { countryDisplayName } from "@/lib/format";

export default function CorridorsPage() {
  const [corridors, setCorridors] = useState<Corridor[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [fromCountry, setFromCountry] = useState<CountryCode>("TD");
  const [toCountry, setToCountry] = useState<CountryCode>("CM");
  const [sourcePartnerId, setSourcePartnerId] = useState("");
  const [destinationPartnerId, setDestinationPartnerId] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const { t } = useI18n();
  const dataRevision = useDataRevision();

  const load = () => corridorService.listCorridors().then(setCorridors);
  useEffect(() => {
    load();
    partnerService.listPartners().then(setPartners);
  }, [dataRevision]);

  const sourcePartners = partners.filter((partner) => partner.country === fromCountry);
  const destinationPartners = partners.filter((partner) => partner.country === toCountry);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await corridorService.createCorridor({
        fromCountry,
        toCountry,
        sourcePartnerId,
        destinationPartnerId,
        enabled: true,
        fxRate: 1,
        serviceChargePct: 2,
        dailyLimit: 5_000_000,
        monthlyLimit: 40_000_000,
        perTxnLimit: 1_000_000,
        revenueSharePct: 25,
        settlementFrequency: "Daily",
        minAmount: 5_000,
        maxTxnsPerDay: 100,
        allowInward: true,
        allowOutward: true,
      });
      push("success", t("corridors.created", { from: created.fromCountry, to: created.toCountry }));
      setCreating(false);
      load();
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "duplicate") push("error", t("corridors.duplicate"));
      else if (code === "same_country") push("error", t("corridors.sameCountry"));
      else push("error", t("corridors.notFound"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleCorridor(corridor: Corridor) {
    try {
      const updated = await corridorService.updateCorridor(corridor.id, {
        enabled: !corridor.enabled,
      });
      setCorridors((current) =>
        current?.map((item) => (item.id === updated.id ? updated : item)) ?? current,
      );
      push(
        "success",
        t("corridors.toggled", {
          from: updated.fromCountry,
          to: updated.toCountry,
          state: updated.enabled ? t("common.enabled") : t("common.disabled"),
        }),
      );
    } catch {
      push("error", t("corridors.notFound"));
    }
  }

  return (
    <div>
      <Topbar
        title={t("corridors.title")}
        subtitle={t("corridors.subtitle")}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" /> {t("corridors.create")}
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          {!corridors ? (
            <TableSkeleton rows={3} cols={6} />
          ) : corridors.length === 0 ? (
            <EmptyState icon={Waypoints} title={t("corridors.empty")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-border text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
                    <th className="px-5 py-3">{t("corridors.col.corridor")}</th>
                    <th className="px-5 py-3">{t("corridors.currency")}</th>
                    <th className="px-5 py-3">{t("corridors.col.status")}</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {corridors.map((c) => {
                    const from = countryByCode(c.fromCountry);
                    const to = countryByCode(c.toCountry);
                    const sourcePartner = partners.find((partner) => partner.id === c.sourcePartnerId);
                    const destinationPartner = partners.find((partner) => partner.id === c.destinationPartnerId);
                    return (
                      <tr key={c.id} className="text-[13.5px] hover:bg-surface-sunken">
                        <td className="px-5 py-3.5">
                          <Link href={`/hub/corridors/${c.id}`} className="flex items-center gap-1.5 font-medium text-text-primary hover:text-blue-600">
                            <span>{from.flag}</span> {countryDisplayName(from.code)}
                            <span className="text-text-tertiary">→</span>
                            <span>{to.flag}</span> {countryDisplayName(to.code)}
                          </Link>
                          {sourcePartner && destinationPartner && (
                            <p className="mt-1 text-xs text-text-tertiary">
                              {sourcePartner.name} → {destinationPartner.name}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary">
                          {t("corridors.currencyLine", { from: from.currency, to: to.currency })}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusChip status={c.enabled ? "active" : "inactive"} />
                        </td>
                        <td className="px-5 py-3.5 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/hub/corridors/${c.id}`} className="text-xs font-medium text-blue-600 hover:underline">
                              {t("corridors.viewSettle")}
                            </Link>
                            <Link href={`/hub/transactions?corridor=${c.id}`} className="text-xs font-medium text-blue-600 hover:underline">
                              {t("corridors.viewTxns")}
                            </Link>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => toggleCorridor(c)}
                            >
                              <Power className="h-3.5 w-3.5" />
                              {c.enabled ? t("common.disable") : t("common.enable")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <Modal open={creating} onClose={() => setCreating(false)} title={t("corridors.create")}>
        <form onSubmit={create} className="space-y-4">
          <p className="text-[13px] text-text-secondary">{t("corridors.createHint")}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("corridors.from")}</Label>
              <Select
                value={fromCountry}
                onChange={(e) => {
                  setFromCountry(e.target.value as CountryCode);
                  setSourcePartnerId("");
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {countryDisplayName(c.code)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{t("corridors.to")}</Label>
              <Select
                value={toCountry}
                onChange={(e) => {
                  setToCountry(e.target.value as CountryCode);
                  setDestinationPartnerId("");
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {countryDisplayName(c.code)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{t("corridors.sourcePartner")}</Label>
              <Select required value={sourcePartnerId} onChange={(e) => setSourcePartnerId(e.target.value)}>
                <option value="">{t("corridors.selectPartner")}</option>
                {sourcePartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>{partner.name} ({partner.id})</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{t("corridors.destinationPartner")}</Label>
              <Select required value={destinationPartnerId} onChange={(e) => setDestinationPartnerId(e.target.value)}>
                <option value="">{t("corridors.selectPartner")}</option>
                {destinationPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>{partner.name} ({partner.id})</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>{t("corridors.create")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

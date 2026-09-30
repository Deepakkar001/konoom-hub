"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Banknote,
  ArrowLeftRight,
  Landmark,
  Wallet,
  Ban,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldHint } from "@/components/ui/Field";
import { StatusChip } from "@/components/ui/StatusChip";
import { StatCard } from "@/components/feature/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { partnerService, transactionService, partnerCorridorService } from "@/lib/services";
import { countryDisplayName, formatCompact, formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { countryByCode, AUDIT_EVENTS } from "@/lib/mock-data";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Corridor, Partner, PartnerCorridorConfig, PartnerStatus, Transaction } from "@/lib/types";
import { useDataRevision } from "@/lib/use-data-revision";
import { CorridorSettingsForm } from "@/components/feature/CorridorSettingsForm";

const TAB_KEYS: { id: string; label: MessageKey }[] = [
  { id: "Overview", label: "detail.tabs.overview" },
  { id: "Configuration", label: "detail.tabs.config" },
  { id: "Access & API", label: "detail.tabs.access" },
  { id: "Transactions", label: "detail.tabs.txns" },
  { id: "Audit Log", label: "detail.tabs.audit" },
];

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const { t } = useI18n();
  const [partner, setPartner] = useState<Partner | null | undefined>(undefined);
  const [tab, setTab] = useState(TAB_KEYS[0].id);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested && TAB_KEYS.some((item) => item.id === requested)) setTab(requested);
  }, []);
  const [rows, setRows] = useState<{ corridor: Corridor; config: PartnerCorridorConfig }[] | null>(null);
  const [txns, setTxns] = useState<Transaction[] | null>(null);
  const dataRevision = useDataRevision();

  useEffect(() => {
    partnerService.getPartner(id).then((p) => setPartner(p ?? null));
  }, [id, dataRevision]);

  useEffect(() => {
    if (tab === "Configuration") partnerCorridorService.listPartnerCorridorConfigs(id).then(setRows);
    if (tab === "Transactions")
      transactionService
        .searchTransactions({ partnerId: id, pageSize: 8 })
        .then((r) => setTxns(r.items));
  }, [tab, id, dataRevision]);

  async function toggleStatus() {
    if (!partner) return;
    const next: PartnerStatus = partner.status === "active" ? "suspended" : "active";
    const updated = await partnerService.setPartnerStatus(partner.id, next);
    setPartner(updated);
    push("success", t("detail.statusChanged", { name: updated.name, status: translateKnown(t, next) }));
  }

  async function saveCorridor(corridor: Corridor, draft: Omit<Corridor, "id">) {
    try {
      await partnerCorridorService.savePartnerCorridorConfig(id, corridor.id, {
        enabled: draft.enabled,
        fxRate: draft.fxRate,
        serviceChargePct: draft.serviceChargePct,
        dailyLimit: draft.dailyLimit,
        monthlyLimit: draft.monthlyLimit,
        perTxnLimit: draft.perTxnLimit,
        settlementFrequency: draft.settlementFrequency,
        minAmount: draft.minAmount,
        maxTxnsPerDay: draft.maxTxnsPerDay,
        allowInward: draft.allowInward,
        allowOutward: draft.allowOutward,
      });
      push("success", t("detail.updated", { from: corridor.fromCountry, to: corridor.toCountry }));
    } catch {
      push("error", t("corridors.notFound"));
    }
  }

  if (partner === undefined) {
    return (
      <div>
        <Topbar title={t("common.loadingPartner")} />
        <div className="p-6"><TableSkeleton rows={4} cols={3} /></div>
      </div>
    );
  }
  if (partner === null) {
    return (
      <div>
        <Topbar title={t("common.partnerNotFound")} />
        <div className="p-6">
          <Link href="/hub/partners" className="text-sm text-blue-600 hover:underline">
            {t("common.backToPartners")}
          </Link>
        </div>
      </div>
    );
  }

  const country = countryByCode(partner.country);

  return (
    <div>
      <Topbar
        title={partner.name}
        subtitle={partner.id}
        actions={
          <Button
            size="sm"
            variant={partner.status === "active" ? "danger" : "primary"}
            onClick={toggleStatus}
          >
            {partner.status === "active" ? (
              <><Ban className="h-3.5 w-3.5" /> {t("common.deactivate")}</>
            ) : (
              <><CheckCircle2 className="h-3.5 w-3.5" /> {t("common.activate")}</>
            )}
          </Button>
        }
      />

      <div className="p-6">
        <button
          onClick={() => router.push("/hub/partners")}
          className="mb-4 flex items-center gap-1 text-[13px] font-medium text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:-scale-x-100" /> {t("common.backToPartners")}
        </button>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-3xl">{country.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">{partner.legalName}</h2>
              <StatusChip status={partner.status} />
            </div>
            <p className="text-[13px] text-text-secondary">
              {t("pprofile.line", {
                type: translateKnown(t, partner.partnerType),
                country: countryDisplayName(partner.country),
                date: formatDate(partner.onboardedDate),
              })}
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("dash.txns")} value={formatCompact(partner.stats.totalTransactions)} icon={ArrowLeftRight} accent="navy" />
          <StatCard label={t("partners.remittanceValue")} value={formatCurrency(partner.stats.totalRemittanceValue)} icon={Banknote} accent="blue" />
          <StatCard label={t("dash.outstanding")} value={formatCurrency(partner.stats.outstandingSettlement)} icon={Landmark} accent="gold" />
          <StatCard label={t("dash.liquidity")} value={formatCurrency(partner.stats.availableLiquidity)} icon={Wallet} accent="green" />
        </div>

        <Card>
          <Tabs tabs={TAB_KEYS.map((item) => ({ id: item.id, label: t(item.label) }))} active={tab} onChange={setTab} />

          {tab === "Overview" && (
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-[13px] font-semibold text-text-primary">{t("detail.description")}</h4>
                <p className="text-[13.5px] leading-relaxed text-text-secondary">{partner.description}</p>
                <h4 className="mb-2 mt-5 text-[13px] font-semibold text-text-primary">{t("detail.legal")}</h4>
                <dl className="space-y-2 text-[13px]">
                  <Row label={t("detail.entity")} value={translateKnown(t, partner.legalEntityType)} />
                  <Row label={t("detail.regNo")} value={partner.registrationNo} />
                  <Row label={t("detail.apiStatus")} value={<StatusChip status={partner.stats.apiStatus} />} />
                </dl>
              </div>
              <div>
                <h4 className="mb-2 text-[13px] font-semibold text-text-primary">{t("detail.contact")}</h4>
                <dl className="space-y-2 text-[13px]">
                  <Row label={t("field.name")} value={`${partner.contact.name} · ${translateKnown(t, partner.contact.designation)}`} />
                  <Row label={t("field.email")} value={partner.contact.email} />
                  <Row label={t("field.mobile")} value={partner.contact.phone} />
                  {partner.contact.officePhone && <Row label={t("onboard.office")} value={partner.contact.officePhone} />}
                  <Row label={t("onboard.address")} value={partner.contact.address} />
                </dl>
              </div>
            </div>
          )}

          {tab === "Configuration" && (
            <div className="p-6">
              <p className="mb-4 text-[13px] text-text-secondary">{t("detail.configIntro")}</p>
              {!rows ? (
                <TableSkeleton rows={2} cols={5} />
              ) : rows.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border-strong p-6 text-center text-[13px] text-text-tertiary">
                  {t("detail.noCorridors")}
                </p>
              ) : (
                <div className="space-y-4">
                  {rows.map(({ corridor, config }) => (
                    <div key={corridor.id} className="rounded-lg border border-border p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-text-primary">
                            {corridor.fromCountry} → {corridor.toCountry}
                          </span>
                          <StatusChip status={config.enabled ? "active" : "inactive"} />
                        </div>
                        <span className="flex items-center gap-3 text-xs">
                          <Link href={`/hub/corridors/${corridor.id}`} className="font-medium text-blue-600 hover:underline">{t("corridors.viewSettle")}</Link>
                          <Link href={`/hub/transactions?corridor=${corridor.id}`} className="font-medium text-blue-600 hover:underline">{t("corridors.viewTxns")}</Link>
                        </span>
                      </div>
                      <CorridorSettingsForm
                        key={`${corridor.id}-${dataRevision}`}
                        corridor={corridorForForm(corridor, config)}
                        mode="full"
                        onSave={(draft) => saveCorridor(corridor, draft)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Access & API" && (
            <PartnerAccessForm
              key={`${partner.id}-${partner.access.apiKeyMasked}-${dataRevision}`}
              partner={partner}
            />
          )}

          {tab === "Transactions" && (
            <div>
              {!txns ? (
                <TableSkeleton rows={6} cols={4} />
              ) : (
                <div className="divide-y divide-border">
                  {txns.map((txn) => (
                    <Link
                      key={txn.id}
                      href={`/hub/transactions/${txn.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-surface-sunken"
                    >
                      <div className="min-w-0">
                        <p className="font-ref truncate text-[12.5px] font-medium text-text-primary">{txn.id}</p>
                        <p className="text-xs text-text-tertiary">
                          {txn.senderCountry} → {txn.recipientCountry} · {formatDateTime(txn.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular-nums text-[13px] font-medium text-text-primary">
                          {formatCurrency(txn.sendingAmount, txn.sendingCurrency)}
                        </span>
                        <StatusChip status={txn.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Audit Log" && (
            <div className="divide-y divide-border">
              {AUDIT_EVENTS.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="text-[13.5px] text-text-primary">
                      <span className="font-medium">{e.actor}</span> {translateKnown(t, e.action)}
                    </p>
                    <p className="text-xs text-text-tertiary">{e.target}</p>
                  </div>
                  <span className="text-xs text-text-tertiary">{formatDateTime(e.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="text-end font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function PartnerAccessForm({
  partner,
}: {
  partner: Partner;
}) {
  const { t } = useI18n();
  const { push } = useToast();

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(partner.access.apiKeyMasked);
      push("success", t("detail.keyCopied"));
    } catch {
      push("error", t("detail.copyFailed"));
    }
  }

  async function copySecretKey() {
    try {
      await navigator.clipboard.writeText(partner.access.apiSecretKeyMasked ?? "");
      push("success", t("detail.keyCopied"));
    } catch {
      push("error", t("detail.copyFailed"));
    }
  }

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      push("success", t("detail.keyCopied"));
    } catch {
      push("error", t("detail.copyFailed"));
    }
  }

  return (
    <div className="w-full space-y-4 p-6 text-black">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required className="text-black">{t("onboard.baseUrl")}</Label>
          <div className="flex gap-2">
            <Input value={partner.access.baseUrl} disabled className="font-ref text-black disabled:text-black" />
            <Button type="button" variant="secondary" size="sm" className="text-black" onClick={() => copyValue(partner.access.baseUrl)}>
              <Copy className="h-3.5 w-3.5" /> {t("common.copy")}
            </Button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-black">{t("detail.apiKey")}</Label>
          <div className="flex gap-2">
            <Input value={partner.access.apiKeyMasked} disabled className="font-ref text-black disabled:text-black" />
            <Button type="button" variant="secondary" size="sm" className="text-black" onClick={copyKey}>
              <Copy className="h-3.5 w-3.5" /> {t("common.copy")}
            </Button>
          </div>
          <FieldHint className="text-black">{t("pconfig.regen")}</FieldHint>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-black">{t("detail.apiSecretKey")}</Label>
          <div className="flex gap-2">
            <Input value={partner.access.apiSecretKeyMasked ?? "sk_•••••••••••"} disabled className="font-ref text-black disabled:text-black" />
            <Button type="button" variant="secondary" size="sm" className="text-black" onClick={copySecretKey}>
              <Copy className="h-3.5 w-3.5" /> {t("common.copy")}
            </Button>
          </div>
          <FieldHint className="text-black">{t("detail.secretHint")}</FieldHint>
        </div>
        <div>
          <Label className="text-black">{t("detail.callback")}</Label>
          <div className="flex gap-2">
            <Input
              value={partner.access.callbackUrl ?? ""}
              disabled
              placeholder="https://your-platform.com/webhooks/konoom"
              className="font-ref text-black disabled:text-black"
            />
            <Button type="button" variant="secondary" size="sm" className="text-black" onClick={() => copyValue(partner.access.callbackUrl ?? "")}>
              <Copy className="h-3.5 w-3.5" /> {t("common.copy")}
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-black">{t("detail.ip")}</Label>
          <div className="flex gap-2">
            <Input
              value={partner.access.ipWhitelist ?? ""}
              disabled
              placeholder="203.0.113.10, 203.0.113.11"
              className="font-ref text-black disabled:text-black"
            />
            <Button type="button" variant="secondary" size="sm" className="text-black" onClick={() => copyValue(partner.access.ipWhitelist ?? "")}>
              <Copy className="h-3.5 w-3.5" /> {t("common.copy")}
            </Button>
          </div>
          <FieldHint className="text-black">{t("pconfig.ipHint")}</FieldHint>
        </div>
      </div>
    </div>
  );
}

function corridorForForm(corridor: Corridor, config: PartnerCorridorConfig): Corridor {
  return {
    ...corridor,
    enabled: config.enabled,
    fxRate: config.fxRate,
    serviceChargePct: config.serviceChargePct,
    dailyLimit: config.dailyLimit,
    monthlyLimit: config.monthlyLimit,
    perTxnLimit: config.perTxnLimit,
    revenueSharePct: config.revenueSharePct,
    settlementFrequency: config.settlementFrequency,
    minAmount: config.minAmount,
    maxTxnsPerDay: config.maxTxnsPerDay,
    allowInward: config.allowInward,
    allowOutward: config.allowOutward,
  };
}

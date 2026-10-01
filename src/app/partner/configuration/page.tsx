"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldHint } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { partnerService, partnerCorridorService } from "@/lib/services";
import { countryByCode } from "@/lib/mock-data";
import { countryDisplayName, formatCurrency } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Corridor, Partner, PartnerCorridorConfig } from "@/lib/types";
import { useDataRevision } from "@/lib/use-data-revision";
import { CorridorSettingsForm } from "@/components/feature/CorridorSettingsForm";
import { CorridorSettlement } from "@/components/feature/CorridorSettlement";

export default function PartnerConfigurationPage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [rows, setRows] = useState<{ corridor: Corridor; config: PartnerCorridorConfig }[] | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [tab, setTab] = useState("corridors");
  const [corridorTab, setCorridorTab] = useState("");
  const { push } = useToast();
  const { t } = useI18n();
  const dataRevision = useDataRevision();

  useEffect(() => {
    if (!user?.partnerId) return;
    partnerService.getPartner(user.partnerId).then((p) => {
      if (p) {
        setPartner(p);
        setCallbackUrl(p.access.callbackUrl ?? "");
        setIpWhitelist(p.access.ipWhitelist ?? "");
      }
    });
    partnerCorridorService.listPartnerCorridorConfigs(user.partnerId).then((nextRows) => {
      setRows(nextRows);
      setCorridorTab((current) => current && nextRows.some((row) => row.corridor.id === current) ? current : nextRows[0]?.corridor.id ?? "");
    });
  }, [user?.partnerId, dataRevision]);

  return (
    <div>
      <Topbar title={t("nav.configuration")} subtitle={t("pconfig.subtitle")} />
      <div className="w-full space-y-6 p-6">
        <Tabs
          tabs={[
            { id: "corridors", label: t("pconfig.corridors") },
            { id: "api", label: t("pconfig.api") },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === "corridors" && <Card>
          <CardHeader title={t("pconfig.corridors")} subtitle={t("pconfig.corridorsSub")} />
          {!rows ? (
            <TableSkeleton rows={2} cols={4} />
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-[13px] text-text-tertiary">
              {t("pconfig.empty")}
            </p>
          ) : (
            <div className="space-y-5 p-5">
              <Tabs
                tabs={rows.map(({ corridor }) => {
                  const from = countryByCode(corridor.fromCountry);
                  const to = countryByCode(corridor.toCountry);
                  return {
                    id: corridor.id,
                    label: `${from.flag} ${countryDisplayName(from.code)} → ${to.flag} ${countryDisplayName(to.code)}`,
                  };
                })}
                active={corridorTab}
                onChange={setCorridorTab}
              />
              {rows.filter(({ corridor }) => corridor.id === corridorTab).map(({ corridor, config }) => {
                const from = countryByCode(corridor.fromCountry);
                const to = countryByCode(corridor.toCountry);
                return (
                  <div key={corridor.id} className="rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-text-primary">
                          <span>{from.flag}</span> {countryDisplayName(from.code)} <span className="text-text-tertiary">→</span> <span>{to.flag}</span> {countryDisplayName(to.code)}
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          {t("pconfig.meta", {
                            rate: config.fxRate,
                            fee: config.serviceChargePct,
                            limit: formatCurrency(config.perTxnLimit, from.currency),
                          })}
                        </p>
                        <Link href={`/partner/transactions?corridor=${corridor.id}`} className="mt-2 inline-block text-[13px] font-medium text-blue-600 hover:underline">
                          {t("corridors.viewTxns")}
                        </Link>
                      </div>
                      <StatusChip status={config.enabled ? "active" : "inactive"} />
                    </div>
                    <CorridorSettingsForm
                      key={`${corridor.id}-${dataRevision}`}
                      corridor={{
                        ...corridor,
                        minAmount: config.minAmount,
                        maxTxnsPerDay: config.maxTxnsPerDay,
                        allowInward: config.allowInward,
                        allowOutward: config.allowOutward,
                        settlementFrequency: config.settlementFrequency,
                      }}
                      mode="rules"
                      readOnly
                      onSave={async (draft) => {
                        if (!user?.partnerId) return;
                        await partnerCorridorService.savePartnerCorridorConfig(user.partnerId, corridor.id, {
                          minAmount: draft.minAmount,
                          maxTxnsPerDay: draft.maxTxnsPerDay,
                          allowInward: draft.allowInward,
                          allowOutward: draft.allowOutward,
                          settlementFrequency: draft.settlementFrequency,
                        });
                        push("success", t("pconfig.rulesSaved"));
                      }}
                    />
                    <div className="mt-4">
                      <CorridorSettlement corridor={corridor} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>}

        {tab === "api" && <Card>
          <Card>
            <CardHeader title={t("pconfig.api")} subtitle={t("pconfig.apiSub")} />
            <div className="space-y-4 p-5">
              {partner && (
                <div>
                  <Label>{t("detail.apiKey")}</Label>
                  <div className="flex gap-2">
                    <Input value={partner.access.apiKeyMasked} disabled className="font-ref text-black disabled:text-black" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(partner.access.apiKeyMasked);
                          push("success", t("detail.keyCopied"));
                        } catch {
                          push("error", t("detail.copyFailed"));
                        }
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <FieldHint>{t("pconfig.regen")}</FieldHint>
                </div>
              )}
              <div>
                <Label>{t("detail.callback")}</Label>
                <Input value={callbackUrl} disabled className="text-black disabled:text-black" placeholder="https://your-platform.com/webhooks/konoom" />
              </div>
              <div>
                <Label>{t("detail.ip")}</Label>
                <Input value={ipWhitelist} disabled className="text-black disabled:text-black" placeholder="203.0.113.10, 203.0.113.11" />
                <FieldHint>{t("pconfig.ipHint")}</FieldHint>
              </div>
            </div>
          </Card>
        </Card>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save, Copy, RefreshCw } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldHint } from "@/components/ui/Field";
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
  const [saving, setSaving] = useState(false);
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
    partnerCorridorService.listPartnerCorridorConfigs(user.partnerId).then(setRows);
  }, [user?.partnerId, dataRevision]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!partner) return;
    setSaving(true);
    const updated = await partnerService.updatePartnerAccess(partner.id, {
      callbackUrl: callbackUrl.trim() || undefined,
      ipWhitelist: ipWhitelist.trim() || undefined,
    });
    setPartner(updated);
    setSaving(false);
    push("success", t("pconfig.saved"));
  }

  return (
    <div>
      <Topbar title={t("nav.configuration")} subtitle={t("pconfig.subtitle")} />
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Card>
          <CardHeader title={t("pconfig.corridors")} subtitle={t("pconfig.corridorsSub")} />
          {!rows ? (
            <TableSkeleton rows={2} cols={4} />
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-[13px] text-text-tertiary">
              {t("pconfig.empty")}
            </p>
          ) : (
            <div className="space-y-6 p-5">
              {rows.map(({ corridor, config }) => {
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
        </Card>

        <form onSubmit={save}>
          <Card>
            <CardHeader title={t("pconfig.api")} subtitle={t("pconfig.apiSub")} />
            <div className="space-y-4 p-5">
              {partner && (
                <div>
                  <Label>{t("detail.apiKey")}</Label>
                  <div className="flex gap-2">
                    <Input value={partner.access.apiKeyMasked} disabled className="font-ref" />
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
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        const updated = await partnerService.regeneratePartnerApiKey(partner.id);
                        setPartner(updated);
                        push("success", t("detail.keyRegenerated"));
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <FieldHint>{t("pconfig.regen")}</FieldHint>
                </div>
              )}
              <div>
                <Label>{t("detail.callback")}</Label>
                <Input value={callbackUrl} onChange={(e) => setCallbackUrl(e.target.value)} placeholder="https://your-platform.com/webhooks/konoom" />
              </div>
              <div>
                <Label>{t("detail.ip")}</Label>
                <Input value={ipWhitelist} onChange={(e) => setIpWhitelist(e.target.value)} placeholder="203.0.113.10, 203.0.113.11" />
                <FieldHint>{t("pconfig.ipHint")}</FieldHint>
              </div>
            </div>
            <div className="flex justify-end border-t border-border px-5 py-4">
              <Button type="submit" loading={saving}>
                <Save className="h-3.5 w-3.5" /> {t("common.saveChanges")}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

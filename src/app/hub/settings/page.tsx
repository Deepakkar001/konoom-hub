"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, FieldHint } from "@/components/ui/Field";
import { useToast } from "@/lib/toast-context";
import { resetBrowserData } from "@/lib/services/browser-store";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function SettingsPage() {
  const { push } = useToast();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      push("success", t("settings.saved"));
    }, 500);
  }

  function resetData() {
    resetBrowserData();
    push("success", t("settings.restored"));
  }

  return (
    <div>
      <Topbar title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader title={t("settings.general")} subtitle={t("settings.generalSub")} />
          <form onSubmit={save} className="space-y-4 p-5">
            <div>
              <Label>{t("settings.platform")}</Label>
              <Input defaultValue="Konoom Central Hub" />
            </div>
            <div>
              <Label>{t("settings.email")}</Label>
              <Input defaultValue="support@konoom.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("settings.currency")}</Label>
                <Select defaultValue="XAF">
                  <option value="XAF">{t("settings.currency.xaf")}</option>
                  <option value="USD">{t("settings.currency.usd")}</option>
                </Select>
              </div>
              <div>
                <Label>{t("settings.timeout")}</Label>
                <Input type="number" defaultValue={30} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("settings.lockout")}</Label>
                <Input type="number" defaultValue={5} />
              </div>
              <div>
                <Label>{t("settings.rate")}</Label>
                <Input type="number" defaultValue={600} />
              </div>
            </div>
            <FieldHint>{t("settings.hint")}</FieldHint>
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving}>
                <Save className="h-3.5 w-3.5" /> {t("common.saveSettings")}
              </Button>
            </div>
          </form>
        </Card>

        {/* <Card>
          <CardHeader title={t("settings.local")} subtitle={t("settings.localSub")} />
          <div className="flex items-center justify-between gap-6 p-5">
            <div>
              <p className="text-[13.5px] font-medium text-text-primary">{t("settings.restoreTitle")}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-text-secondary">{t("settings.restoreBody")}</p>
            </div>
            <Button type="button" variant="secondary" onClick={resetData}>
              <RotateCcw className="h-3.5 w-3.5" /> {t("common.restore")}
            </Button>
          </div>
        </Card> */}
      </div>
    </div>
  );
}

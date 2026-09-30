"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { COUNTRIES, countryByCode } from "@/lib/mock-data";
import { countryDisplayName } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { Corridor, CountryCode } from "@/lib/types";

const FREQUENCIES: Corridor["settlementFrequency"][] = ["Daily", "Weekly", "Bi-weekly", "Monthly"];

export type CorridorDraft = Omit<Corridor, "id">;

export function CorridorSettingsForm({
  corridor,
  mode,
  onSave,
}: {
  corridor?: Corridor;
  mode: "full" | "rules";
  onSave: (draft: CorridorDraft) => Promise<void>;
}) {
  const { t } = useI18n();
  const [fromCountry, setFromCountry] = useState<CountryCode>(corridor?.fromCountry ?? "TD");
  const [toCountry, setToCountry] = useState<CountryCode>(corridor?.toCountry ?? "CM");
  const [fxRate, setFxRate] = useState(corridor?.fxRate ?? 1);
  const [serviceChargePct, setServiceChargePct] = useState(corridor?.serviceChargePct ?? 2);
  const [perTxnLimit, setPerTxnLimit] = useState(corridor?.perTxnLimit ?? 1_000_000);
  const [dailyLimit, setDailyLimit] = useState(corridor?.dailyLimit ?? 5_000_000);
  const [monthlyLimit, setMonthlyLimit] = useState(corridor?.monthlyLimit ?? 40_000_000);
  const [minAmount, setMinAmount] = useState(corridor?.minAmount ?? 5_000);
  const [maxTxnsPerDay, setMaxTxnsPerDay] = useState(corridor?.maxTxnsPerDay ?? 100);
  const [allowInward, setAllowInward] = useState(corridor?.allowInward ?? true);
  const [allowOutward, setAllowOutward] = useState(corridor?.allowOutward ?? true);
  const [settlementFrequency, setSettlementFrequency] = useState<Corridor["settlementFrequency"]>(
    corridor?.settlementFrequency ?? "Daily",
  );
  const [enabled, setEnabled] = useState(corridor?.enabled ?? true);
  const [saving, setSaving] = useState(false);

  const from = countryByCode(fromCountry);
  const to = countryByCode(toCountry);
  const creating = !corridor;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        fromCountry,
        toCountry,
        enabled,
        fxRate,
        serviceChargePct,
        dailyLimit,
        monthlyLimit,
        perTxnLimit,
        revenueSharePct: corridor?.revenueSharePct ?? 25,
        settlementFrequency,
        minAmount,
        maxTxnsPerDay,
        allowInward,
        allowOutward,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {mode === "full" && (
        <>
          {creating ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("corridors.from")}</Label>
                <Select value={fromCountry} onChange={(e) => setFromCountry(e.target.value as CountryCode)}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {countryDisplayName(c.code)}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{t("corridors.to")}</Label>
                <Select value={toCountry} onChange={(e) => setToCountry(e.target.value as CountryCode)}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {countryDisplayName(c.code)}</option>
                  ))}
                </Select>
              </div>
            </div>
          ) : null}
          <div>
            <Label>{t("corridors.currency")}</Label>
            <p className="rounded-lg border border-border bg-surface-sunken px-3 py-2 text-[13.5px] text-text-primary">
              {t("corridors.currencyLine", { from: from.currency, to: to.currency })}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("detail.fx")}</Label>
              <Input type="number" step="0.0001" min="0" value={fxRate} onChange={(e) => setFxRate(Number(e.target.value))} required />
            </div>
            <div>
              <Label>{t("detail.charge")}</Label>
              <Input type="number" step="0.1" min="0" value={serviceChargePct} onChange={(e) => setServiceChargePct(Number(e.target.value))} required />
            </div>
            <div>
              <Label>{t("corridors.col.perTxn")}</Label>
              <Input type="number" min="0" value={perTxnLimit} onChange={(e) => setPerTxnLimit(Number(e.target.value))} required />
            </div>
            <div>
              <Label>{t("detail.daily")}</Label>
              <Input type="number" min="0" value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} required />
            </div>
            <div>
              <Label>{t("corridors.monthly")}</Label>
              <Input type="number" min="0" value={monthlyLimit} onChange={(e) => setMonthlyLimit(Number(e.target.value))} required />
            </div>
          </div>
        </>
      )}

      <div>
        <h4 className="text-[13.5px] font-semibold text-text-primary">{t("corridors.rules")}</h4>
        <p className="mt-0.5 mb-3 text-[12.5px] text-text-secondary">{t("corridors.rulesSub")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("corridors.minAmount")}</Label>
            <Input type="number" min="0" value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} required />
          </div>
          <div>
            <Label>{t("corridors.velocity")}</Label>
            <Input type="number" min="1" value={maxTxnsPerDay} onChange={(e) => setMaxTxnsPerDay(Number(e.target.value))} required />
          </div>
          <label className="flex items-center gap-2 text-[13.5px] text-text-primary">
            <input type="checkbox" checked={allowInward} onChange={(e) => setAllowInward(e.target.checked)} />
            {t("corridors.allowIn")}
          </label>
          <label className="flex items-center gap-2 text-[13.5px] text-text-primary">
            <input type="checkbox" checked={allowOutward} onChange={(e) => setAllowOutward(e.target.checked)} />
            {t("corridors.allowOut")}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>{t("settle.col.freq")}</Label>
          <Select
            value={settlementFrequency}
            onChange={(e) => setSettlementFrequency(e.target.value as Corridor["settlementFrequency"])}
          >
            {FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>{translateKnown(t, freq)}</option>
            ))}
          </Select>
        </div>
        {mode === "full" && (
          <label className="flex items-end gap-2 pb-2 text-[13.5px] text-text-primary">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            {t("common.enable")}
          </label>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          <Save className="h-3.5 w-3.5" /> {t("common.saveChanges")}
        </Button>
      </div>
    </form>
  );
}

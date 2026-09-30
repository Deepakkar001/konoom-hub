"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea, FieldHint } from "@/components/ui/Field";
import { partnerService } from "@/lib/services";
import { COUNTRIES } from "@/lib/mock-data";
import { countryDisplayName } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { MessageKey } from "@/lib/i18n/messages";
import type { CountryCode, Partner, PartnerType } from "@/lib/types";

const STEP_KEYS: MessageKey[] = [
  "onboard.step.details",
  "onboard.step.contact",
  "onboard.step.access",
  "onboard.step.review",
];
const STEP_TITLES: MessageKey[] = [
  "onboard.s1.title",
  "onboard.s2.title",
  "onboard.s3.title",
  "onboard.s5.title",
];
const STEP_SUBS: MessageKey[] = [
  "onboard.s1.sub",
  "onboard.s2.sub",
  "onboard.s3.sub",
  "onboard.s5.sub",
];

interface FormState {
  partnerId: string;
  name: string;
  legalName: string;
  legalEntityType: string;
  registrationNo: string;
  country: CountryCode;
  currency: "USD" | "XAF";
  partnerType: PartnerType;
  description: string;
  contactName: string;
  designation: string;
  email: string;
  phone: string;
  officePhone: string;
  address: string;
  callbackUrl: string;
  ipWhitelist: string;
}

const initial: FormState = {
  partnerId: `KON-${"XXX"}-${String(Math.floor(Math.random() * 900) + 100)}`,
  name: "",
  legalName: "",
  legalEntityType: "Private Limited Company",
  registrationNo: "",
  country: "TD",
  currency: "XAF",
  partnerType: "Mobile Money",
  description: "",
  contactName: "",
  designation: "Partnership Manager",
  email: "",
  phone: "",
  officePhone: "",
  address: "",
  callbackUrl: "",
  ipWhitelist: "",
};

export default function RegisterPartnerPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { push } = useToast();
  const { t } = useI18n();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepValid = (() => {
    switch (step) {
      case 0:
        return !!(form.name && form.legalName && form.registrationNo && form.description);
      case 1:
        return !!(form.contactName && form.email && form.phone && form.address);
      case 2:
        return true;
      default:
        return true;
    }
  })();

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const partner: Partner = {
        id: form.partnerId,
        name: form.name,
        legalName: form.legalName,
        legalEntityType: form.legalEntityType,
        registrationNo: form.registrationNo,
        description: form.description,
        country: form.country,
        reportingCurrency: form.currency,
        partnerType: form.partnerType,
        status: "pending",
        onboardedDate: new Date().toISOString().slice(0, 10),
        contact: {
          name: form.contactName,
          designation: form.designation,
          email: form.email,
          phone: form.phone,
          officePhone: form.officePhone || undefined,
          address: form.address,
        },
        access: {
          apiAccessType: "REST API",
          apiKeyMasked: partnerService.issueMaskedApiKey(),
          baseUrl: "https://api.konoom.local/v1",
          callbackUrl: form.callbackUrl || undefined,
          ipWhitelist: form.ipWhitelist || undefined,
        },
        corridors: [],
        stats: {
          totalTransactions: 0,
          totalRemittanceValue: 0,
          outstandingSettlement: 0,
          availableLiquidity: 0,
          apiStatus: "offline",
        },
      };
      await partnerService.createPartner(partner);
      push("success", t("onboard.queued", { name: form.name, email: form.email }));
      router.push("/hub/partners");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Topbar title={t("onboard.title")} subtitle={t("onboard.subtitle", { step: step + 1, total: STEP_KEYS.length })} />

      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          {/* Stepper */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-5 py-4">
            {STEP_KEYS.map((label, i) => (
              <div key={label} className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                    i < step
                      ? "bg-success-600 text-white"
                      : i === step
                        ? "bg-blue-600 text-white"
                        : "bg-surface-sunken text-text-tertiary",
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </button>
                <span
                  className={cn(
                    "whitespace-nowrap text-[13px] font-medium",
                    i === step ? "text-text-primary" : "text-text-tertiary",
                  )}
                >
                  {t(label)}
                </span>
                {i < STEP_KEYS.length - 1 && (
                  <div className="mx-1 h-px w-8 bg-border-strong" />
                )}
              </div>
            ))}
          </div>

          <div className="p-6">
            {step === 0 && (
              <StepSection title={t(STEP_TITLES[0])} subtitle={t(STEP_SUBS[0])}>
                <Grid2>
                  <Field label={t("onboard.partnerId")} required>
                    <Input value={form.partnerId} disabled />
                    <FieldHint>{t("onboard.auto")}</FieldHint>
                  </Field>
                  <Field label={t("onboard.businessName")} required>
                    <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Konoom Wallet - Chad" />
                  </Field>
                  <Field label={t("onboard.legalName")} required>
                    <Input value={form.legalName} onChange={(e) => set("legalName", e.target.value)} placeholder="Konoom Wallet Chad SARL" />
                  </Field>
                  <Field label={t("onboard.partnerType")} required>
                    <Select value={form.partnerType} onChange={(e) => set("partnerType", e.target.value as PartnerType)}>
                      <option value="Mobile Money">{t("type.wallet")}</option>
                      <option value="Bank">{t("type.bank")}</option>
                    </Select>
                  </Field>
                  <Field label={t("onboard.regNo")} required>
                    <Input value={form.registrationNo} onChange={(e) => set("registrationNo", e.target.value)} placeholder="RC-CHD-12345" />
                  </Field>
                  <Field label={t("onboard.country")} required>
                    <Select value={form.country} onChange={(e) => set("country", e.target.value as CountryCode)}>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {countryDisplayName(c.code)}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={t("settings.currency")} required>
                    <Select value={form.currency} onChange={(e) => set("currency", e.target.value as "USD" | "XAF")}>
                      <option value="XAF">XAF</option>
                      <option value="USD">USD</option>
                    </Select>
                  </Field>
                </Grid2>
                <Field label={t("onboard.description")} required className="mt-4">
                  <Textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    maxLength={500}
                    placeholder="Digital wallet and remittance services provider enabling cross-border transactions through Central Hub."
                  />
                  <FieldHint>{form.description.length}/500</FieldHint>
                </Field>
              </StepSection>
            )}

            {step === 1 && (
              <StepSection title={t(STEP_TITLES[1])} subtitle={t(STEP_SUBS[1])}>
                <Grid2>
                  <Field label={t("onboard.contactName")} required>
                    <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="John Doe" />
                  </Field>
                  <Field label={t("onboard.designation")} required>
                    <Select value={form.designation} onChange={(e) => set("designation", e.target.value)}>
                      <option value="Partnership Manager">{t("onboard.role.pm")}</option>
                      <option value="Country Manager">{t("onboard.role.cm")}</option>
                      <option value="Operations Director">{t("onboard.role.ops")}</option>
                      <option value="Compliance Lead">{t("onboard.role.compliance")}</option>
                    </Select>
                  </Field>
                  <Field label={t("onboard.email")} required>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john.doe@konoom.td" />
                  </Field>
                  <Field label={t("onboard.mobile")} required>
                    <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+235 661234567" />
                  </Field>
                  <Field label={t("onboard.office")}>
                    <Input value={form.officePhone} onChange={(e) => set("officePhone", e.target.value)} placeholder="+235 661234568" />
                  </Field>
                </Grid2>
                <Field label={t("onboard.address")} required className="mt-4">
                  <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={200} placeholder="BP 1234, N'Djamena, Chad" />
                </Field>
              </StepSection>
            )}

            {step === 2 && (
              <StepSection title={t(STEP_TITLES[2])} subtitle={t(STEP_SUBS[2])}>
                <Grid2>
                  <Field label={t("onboard.callback")}>
                    <Input value={form.callbackUrl} onChange={(e) => set("callbackUrl", e.target.value)} placeholder="https://hub.central.com/callback" />
                  </Field>
                  <Field label={t("onboard.ip")}>
                    <Input value={form.ipWhitelist} onChange={(e) => set("ipWhitelist", e.target.value)} placeholder="192.168.1.10, 192.168.1.11" />
                  </Field>
                </Grid2>
              </StepSection>
            )}

            {step === 3 && (
              <StepSection title={t(STEP_TITLES[3])} subtitle={t(STEP_SUBS[3])}>
                <div className="space-y-5">
                  <ReviewGroup title={t("onboard.review.partner")} editLabel={t("common.edit")} onEdit={() => setStep(0)}>
                    <ReviewRow label={t("onboard.businessName")} value={form.name || "—"} />
                    <ReviewRow label={t("field.legalName")} value={form.legalName || "—"} />
                    <ReviewRow label={t("onboard.country")} value={countryDisplayName(form.country)} />
                    <ReviewRow label={t("onboard.partnerType")} value={translateKnown(t, form.partnerType)} />
                  </ReviewGroup>
                  <ReviewGroup title={t("onboard.review.contact")} editLabel={t("common.edit")} onEdit={() => setStep(1)}>
                    <ReviewRow label={t("field.contact")} value={`${form.contactName || "—"} · ${translateKnown(t, form.designation)}`} />
                    <ReviewRow label={t("field.email")} value={form.email || "—"} />
                    <ReviewRow label={t("field.mobile")} value={form.phone || "—"} />
                  </ReviewGroup>
                  <ReviewGroup title={t("onboard.review.access")} editLabel={t("common.edit")} onEdit={() => setStep(2)}>
                    <ReviewRow label={t("onboard.callback")} value={form.callbackUrl || "—"} />
                    <ReviewRow label={t("onboard.ip")} value={form.ipWhitelist || "—"} />
                  </ReviewGroup>
                </div>
              </StepSection>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <Button
              variant="secondary"
              onClick={() => (step === 0 ? router.push("/hub/partners") : setStep((s) => s - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5 rtl:-scale-x-100" /> {step === 0 ? t("common.cancel") : t("onboard.back")}
            </Button>
            {step < STEP_KEYS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid}>
                {t("onboard.next")} <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitting}>
                {t("onboard.submit")}
              </Button>
            )}
          </div>
        </Card>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="text-[13.5px] font-semibold text-text-primary">
              {t("onboard.summary")}
            </h4>
            <div className="mt-4 space-y-4">
              {STEP_KEYS.map((label, i) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      i < step
                        ? "bg-success-600 text-white"
                        : i === step
                          ? "bg-blue-600 text-white"
                          : "bg-surface-sunken text-text-tertiary",
                    )}
                  >
                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{t(label)}</p>
                    <p className="text-xs text-text-tertiary">
                      {i < step ? (form.name || t("common.complete")) : i === step ? t("common.inProgress") : t("dash.pending")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-[13px] font-semibold text-text-primary">{t("onboard.services")}</h4>
            <ul className="mt-2 space-y-1.5 text-[12.5px] text-text-secondary">
              <li>• {t("onboard.svc.in")}</li>
              <li>• {t("onboard.svc.out")}</li>
              <li>• {t("onboard.svc.credit")}</li>
              <li>• {t("onboard.svc.settle")}</li>
            </ul>
          </Card>

          <Card className="p-5">
            <h4 className="text-[13px] font-semibold text-text-primary">{t("onboard.corridorTitle")}</h4>
            <p className="mt-2 text-[12.5px] text-text-secondary">{t("onboard.corridorBody")}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StepSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in">
      <h3 className="text-[14.5px] font-semibold text-text-primary">{title}</h3>
      <p className="mt-0.5 mb-5 text-[13px] text-text-secondary">{subtitle}</p>
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function ReviewGroup({
  title,
  editLabel,
  onEdit,
  children,
}: {
  title: string;
  editLabel: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-text-primary">{title}</p>
        <button onClick={onEdit} className="text-xs font-medium text-blue-600 hover:underline">
          {editLabel}
        </button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[13px]">
      <span className="text-text-tertiary">{label}</span>
      <span className="text-end font-medium text-text-primary">{value}</span>
    </div>
  );
}

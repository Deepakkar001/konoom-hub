"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { partnerService } from "@/lib/services";
import { countryByCode } from "@/lib/mock-data";
import { countryDisplayName, formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { Partner } from "@/lib/types";
import { useDataRevision } from "@/lib/use-data-revision";

export default function PartnerProfilePage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("organization");
  const { push } = useToast();
  const { t } = useI18n();
  const dataRevision = useDataRevision();

  useEffect(() => {
    if (user?.partnerId) partnerService.getPartner(user.partnerId).then((p) => setPartner(p ?? null));
  }, [user?.partnerId, dataRevision]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!partner) return;
    setSaving(true);
    const updated = await partnerService.updatePartner(partner.id, {
      description: partner.description,
      contact: partner.contact,
    });
    setPartner(updated);
    setSaving(false);
    push("success", t("pprofile.saved"));
  }

  if (partner === undefined) {
    return (
      <div>
        <Topbar title={t("common.loadingProfile")} />
        <div className="p-6"><TableSkeleton rows={4} cols={2} /></div>
      </div>
    );
  }
  if (!partner) return null;

  const country = countryByCode(partner.country);

  return (
    <div>
      <Topbar title={t("nav.profile")} subtitle={partner.id} />
      <div className="w-full space-y-6 p-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{country.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">{partner.name}</h2>
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

        <Tabs
          tabs={[
            { id: "organization", label: t("pprofile.org") },
            { id: "contact", label: t("pprofile.contact") },
          ]}
          active={tab}
          onChange={setTab}
        />

        <form onSubmit={save}>
          {tab === "organization" ? (
            <Card>
              <CardHeader title={t("pprofile.org")} subtitle={t("pprofile.orgSub")} />
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <ReadOnly label={t("field.legalName")} value={partner.legalName} />
                <ReadOnly label={t("onboard.entity")} value={partner.legalEntityType} />
                <ReadOnly label={t("detail.regNo")} value={partner.registrationNo} />
                <ReadOnly label={t("onboard.partnerId")} value={partner.id} mono />
              </div>
              <div className="px-5 pb-5">
                <Label>{t("detail.description")}</Label>
                <Textarea
                  value={partner.description}
                  onChange={(e) => setPartner({ ...partner, description: e.target.value })}
                  maxLength={500}
                />
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader title={t("pprofile.contact")} subtitle={t("pprofile.contactSub")} />
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <div>
                  <Label required>{t("onboard.contactName")}</Label>
                  <Input
                    value={partner.contact.name}
                    onChange={(e) => setPartner({ ...partner, contact: { ...partner.contact, name: e.target.value } })}
                  />
                </div>
                <div>
                  <Label required>{t("onboard.designation")}</Label>
                  <Input
                    value={partner.contact.designation}
                    onChange={(e) => setPartner({ ...partner, contact: { ...partner.contact, designation: e.target.value } })}
                  />
                </div>
                <div>
                  <Label required>{t("field.email")}</Label>
                  <Input
                    type="email"
                    value={partner.contact.email}
                    onChange={(e) => setPartner({ ...partner, contact: { ...partner.contact, email: e.target.value } })}
                  />
                </div>
                <div>
                  <Label required>{t("field.mobile")}</Label>
                  <Input
                    value={partner.contact.phone}
                    onChange={(e) => setPartner({ ...partner, contact: { ...partner.contact, phone: e.target.value } })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label required>{t("onboard.address")}</Label>
                  <Textarea
                    value={partner.contact.address}
                    onChange={(e) => setPartner({ ...partner, contact: { ...partner.contact, address: e.target.value } })}
                  />
                </div>
              </div>
            </Card>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="h-3.5 w-3.5" /> {t("common.saveChanges")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReadOnly({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} disabled className={mono ? "font-ref" : ""} />
    </div>
  );
}

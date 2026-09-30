"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { userService, partnerService } from "@/lib/services";
import { formatDate, formatDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import { useDataRevision } from "@/lib/use-data-revision";
import type { Partner, WebUser, WebUserRole, WebUserStatus } from "@/lib/types";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { push } = useToast();
  const dataRevision = useDataRevision();
  const [user, setUser] = useState<WebUser | null | undefined>(undefined);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService.getUser(id).then((found) => setUser(found ?? null));
    partnerService.listPartners().then(setPartners);
  }, [id, dataRevision]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = await userService.updateUser(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        partnerId: user.role === "Partner Admin" ? user.partnerId : undefined,
        status: user.status,
      });
      setUser(updated);
      push("success", t("users.saved"));
    } finally {
      setSaving(false);
    }
  }

  if (user === undefined) {
    return (
      <div>
        <Topbar title={t("common.loadingProfile")} />
        <div className="p-6"><TableSkeleton rows={4} cols={2} /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Topbar title={t("users.notFound")} />
        <div className="p-6">
          <Link href="/hub/users" className="text-sm text-blue-600 hover:underline">{t("users.back")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title={t("users.editTitle")} subtitle={user.id} />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Link href="/hub/users" className="flex w-fit items-center gap-1 text-[13px] font-medium text-text-secondary hover:text-text-primary">
          <ChevronLeft className="h-3.5 w-3.5 rtl:-scale-x-100" /> {t("users.back")}
        </Link>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">{user.name}</h2>
          <StatusChip status={user.status} />
        </div>
        <p className="text-[13px] text-text-secondary">
          {translateKnown(t, user.role)} · {user.lastLogin ? formatDateTime(user.lastLogin) : t("common.never")} · {formatDate(user.createdAt)}
        </p>
        <form onSubmit={save}>
          <Card>
            <CardHeader title={t("hprofile.account")} subtitle={t("users.modalBody")} />
            <div className="space-y-4 p-5">
              <div>
                <Label required>{t("field.fullName")}</Label>
                <Input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} required />
              </div>
              <div>
                <Label required>{t("onboard.email")}</Label>
                <Input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} required />
              </div>
              <div>
                <Label required>{t("field.role")}</Label>
                <Select
                  value={user.role}
                  onChange={(e) => setUser({ ...user, role: e.target.value as WebUserRole })}
                >
                  <option value="Hub Admin">{t("role.hub")}</option>
                  <option value="Partner Admin">{t("role.partner")}</option>
                </Select>
              </div>
              {user.role === "Partner Admin" && (
                <div>
                  <Label required>{t("field.partner")}</Label>
                  <Select
                    value={user.partnerId ?? ""}
                    onChange={(e) => setUser({ ...user, partnerId: e.target.value })}
                    required
                  >
                    <option value="">{t("users.selectPartner")}</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <Label>{t("users.col.status")}</Label>
                <Select
                  value={user.status}
                  onChange={(e) => setUser({ ...user, status: e.target.value as WebUserStatus })}
                >
                  <option value="active">{t("status.partner.active")}</option>
                  <option value="invited">{t("status.user.invited")}</option>
                  <option value="disabled">{t("status.user.disabled")}</option>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={saving}>
                  <Save className="h-3.5 w-3.5" /> {t("common.saveChanges")}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

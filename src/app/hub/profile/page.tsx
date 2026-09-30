"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { StatusChip } from "@/components/ui/StatusChip";
import { useAuth } from "@/lib/auth-context";
import { WEB_USERS, countryByCode } from "@/lib/mock-data";
import { formatDate, formatDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";
import type { SessionUser, WebUser } from "@/lib/types";

export default function HubProfilePage() {
  const { user } = useAuth();
  const [webUser, setWebUser] = useState<WebUser | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    if (user?.email) {
      const found = WEB_USERS.find((u) => u.email === user.email);
      setWebUser(found ?? null);
    }
  }, [user?.email]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!webUser) return;
    setSaving(true);
    // In a real app, we would call an API to update the user.
    // For now, we just simulate a successful save.
    setTimeout(() => {
      setSaving(false);
      push("success", t("hprofile.saved"));
    }, 500);
  }

  if (webUser === undefined) {
    return (
      <div>
        <Topbar title={t("common.loadingProfile")} />
        <div className="p-6"><TableSkeleton rows={4} cols={2} /></div>
      </div>
    );
  }
  if (!webUser) return null;

  return (
    <div>
      <Topbar title={t("hprofile.title")} subtitle={user?.id} />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-[11px] font-semibold text-white">
            {user?.avatarInitials ?? "AD"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{webUser.name}</h2>
            <StatusChip status={webUser.status.toLowerCase() as any} />
          </div>
        </div>

        <p className="text-[13px] text-text-secondary">
          {t("hprofile.line", {
            role: translateKnown(t, webUser.role),
            login: webUser.lastLogin ? formatDateTime(webUser.lastLogin) : t("common.never"),
            joined: formatDate(webUser.createdAt),
          })}
        </p>

        <form onSubmit={save} className="space-y-6">
          <Card>
            <CardHeader title={t("hprofile.account")} subtitle={t("hprofile.accountSub")} />
            <div className="grid grid-cols-1 gap-4 p-5">
              <div>
                <Label>{t("field.name")}</Label>
                <Input
                  value={webUser.name}
                  onChange={(e) => setWebUser({ ...webUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("field.email")}</Label>
                <Input
                  type="email"
                  value={webUser.email}
                  onChange={(e) => setWebUser({ ...webUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("field.role")}</Label>
                <Input value={translateKnown(t, webUser.role)} disabled />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title={t("hprofile.security")} subtitle={t("hprofile.securitySub")} />
            <div className="space-y-4 p-5">
              <div>
                <Label>{t("hprofile.lastLogin")}</Label>
                <Input type="text" value={webUser.lastLogin ? formatDateTime(webUser.lastLogin) : t("common.never")} disabled className="opacity-50" />
              </div>
              <div>
                <Label>{t("hprofile.created")}</Label>
                <Input type="text" value={formatDate(webUser.createdAt)} disabled className="opacity-50" />
              </div>
              {/* In a real app, you would have password change, 2FA, etc. */}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="h-3.5 w-3.5" /> {t("common.saveChanges")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="grid gap-4">
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="grid grid-cols-[repeat(_cols,1fr)] gap-2">
          {[...Array(cols)].map((_, c) => (
            <div key={c} className="h-4 rounded bg-surface-sunken" />
          ))}
        </div>
      ))}
    </div>
  );
}
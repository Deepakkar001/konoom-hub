"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users as UsersIcon } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Field";
import { FilterBar, SearchInput, FilterSelect } from "@/components/feature/FilterBar";
import { userService, partnerService } from "@/lib/services";
import { formatRelative, formatDate } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import type { Partner, WebUser, WebUserRole } from "@/lib/types";
import { useDataRevision } from "@/lib/use-data-revision";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translateKnown } from "@/lib/i18n/labels";

export default function UsersPage() {
  const [users, setUsers] = useState<WebUser[] | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { push } = useToast();
  const { t } = useI18n();
  const dataRevision = useDataRevision();

  const load = () =>
    userService.listUsers({ query: query || undefined, role: (role as WebUserRole) || undefined }).then(setUsers);

  useEffect(() => { load(); }, [query, role, dataRevision]);
  useEffect(() => {
    partnerService.listPartners().then(setPartners);
  }, [dataRevision]);

  return (
    <div>
      <Topbar
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> {t("common.createUser")}
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          <FilterBar>
            <SearchInput value={query} onChange={setQuery} placeholder={t("users.search")} />
            <FilterSelect value={role} onChange={(e) => setRole(e.target.value)} className="w-44">
              <option value="">{t("common.allRoles")}</option>
              <option value="Hub Admin">{t("role.hub")}</option>
              <option value="Partner Admin">{t("role.partner")}</option>
            </FilterSelect>
          </FilterBar>

          {!users ? (
            <TableSkeleton rows={6} cols={5} />
          ) : users.length === 0 ? (
            <EmptyState icon={UsersIcon} title={t("users.empty")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-border text-[12px] font-medium uppercase tracking-wide text-text-tertiary">
                    <th className="px-5 py-3">{t("users.col.user")}</th>
                    <th className="px-5 py-3">{t("users.col.role")}</th>
                    <th className="px-5 py-3">{t("users.col.partner")}</th>
                    <th className="px-5 py-3">{t("users.col.status")}</th>
                    <th className="px-5 py-3">{t("users.col.login")}</th>
                    <th className="px-5 py-3">{t("users.col.created")}</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="text-[13.5px] hover:bg-surface-sunken">
                      <td className="px-5 py-3.5">
                        <Link href={`/hub/users/${u.id}`} className="block">
                          <p className="font-medium text-text-primary hover:text-blue-600">{u.name}</p>
                          <p className="text-xs text-text-tertiary">{u.email}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{translateKnown(t, u.role)}</td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {u.partnerId ? partners.find((p) => p.id === u.partnerId)?.name ?? u.partnerId : "—"}
                      </td>
                      <td className="px-5 py-3.5"><StatusChip status={u.status} /></td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {u.lastLogin ? formatRelative(u.lastLogin) : t("common.never")}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5 text-end">
                        <Link href={`/hub/users/${u.id}`} className="text-[13px] font-medium text-blue-600 hover:underline">
                          {t("users.view")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        partners={partners}
        onCreated={() => {
          load();
          push("success", t("users.created"));
        }}
      />
    </div>
  );
}

function CreateUserModal({
  open,
  onClose,
  partners,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  partners: Partner[];
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WebUserRole>("Hub Admin");
  const [partnerId, setPartnerId] = useState("");
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.createUser({
        name,
        email,
        role,
        partnerId: role === "Partner Admin" ? partnerId : undefined,
      });
      onCreated();
      onClose();
      setName("");
      setEmail("");
      setPartnerId("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("users.modalTitle")} description={t("users.modalBody")}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label required>{t("field.fullName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label required>{t("onboard.email")}</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label required>{t("field.role")}</Label>
          <Select value={role} onChange={(e) => setRole(e.target.value as WebUserRole)}>
            <option value="Hub Admin">{t("role.hub")}</option>
            <option value="Partner Admin">{t("role.partner")}</option>
          </Select>
        </div>
        {role === "Partner Admin" && (
          <div>
            <Label required>{t("field.partner")}</Label>
            <Select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} required>
              <option value="">{t("users.selectPartner")}</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit" loading={saving}>{t("users.invite")}</Button>
        </div>
      </form>
    </Modal>
  );
}

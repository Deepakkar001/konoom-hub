"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { TransactionTable } from "@/components/feature/TransactionTable";
import { CorridorSettlement } from "@/components/feature/CorridorSettlement";
import { corridorService, partnerService } from "@/lib/services";
import { countryByCode } from "@/lib/mock-data";
import { countryDisplayName } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useDataRevision } from "@/lib/use-data-revision";
import type { Corridor, Partner } from "@/lib/types";

export default function CorridorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const dataRevision = useDataRevision();
  const [corridor, setCorridor] = useState<Corridor | null | undefined>(undefined);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    corridorService.getCorridor(id).then((found) => setCorridor(found ?? null));
    partnerService.listPartners().then(setPartners);
  }, [id, dataRevision]);

  if (corridor === undefined) {
    return (
      <div>
        <Topbar title={t("corridors.title")} />
        <div className="p-6"><TableSkeleton rows={4} cols={2} /></div>
      </div>
    );
  }

  if (!corridor) {
    return (
      <div>
        <Topbar title={t("corridors.notFound")} />
        <div className="p-6">
          <Link href="/hub/corridors" className="text-sm text-blue-600 hover:underline">{t("corridors.title")}</Link>
        </div>
      </div>
    );
  }

  const from = countryByCode(corridor.fromCountry);
  const to = countryByCode(corridor.toCountry);
  const participatingPartners = corridor.sourcePartnerId || corridor.destinationPartnerId
    ? partners.filter((partner) => partner.id === corridor.sourcePartnerId || partner.id === corridor.destinationPartnerId)
    : partners.filter((partner) => partner.country === corridor.fromCountry || partner.country === corridor.toCountry);

  return (
    <div>
      <Topbar
        title={`${countryDisplayName(from.code)} → ${countryDisplayName(to.code)}`}
        subtitle={corridor.id}
      />
      <div className="w-full space-y-6 p-6">
        <Link href="/hub/corridors" className="flex w-fit items-center gap-1 text-[13px] font-medium text-text-secondary hover:text-text-primary">
          <ChevronLeft className="h-3.5 w-3.5 rtl:-scale-x-100" /> {t("corridors.title")}
        </Link>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-[13.5px] text-text-secondary">{t("corridors.configOnPartner")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {participatingPartners.map((p) => (
                <Link
                  key={p.id}
                  href={`/hub/partners/${p.id}?tab=Configuration`}
                  className="rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-blue-600 hover:bg-surface-sunken"
                >
                  {corridor.sourcePartnerId === p.id
                    ? `${t("corridors.sourcePartner")}: `
                    : corridor.destinationPartnerId === p.id
                      ? `${t("corridors.destinationPartner")}: `
                      : ""}
                  {p.name}
                </Link>
              ))}
          </div>
        </div>
        <CorridorSettlement corridor={corridor} />
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-text-primary">{t("tx.title")}</h3>
          <Link href={`/hub/transactions?corridor=${corridor.id}`} className="text-[13px] font-medium text-blue-600 hover:underline">
            {t("corridors.viewTxns")}
          </Link>
        </div>
        <TransactionTable corridorId={corridor.id} basePath="/hub/transactions" showPartnerColumn />
      </div>
    </div>
  );
}

import type { Corridor, PartnerCorridorConfig } from "../types";
import { readCollection, writeCollection } from "./browser-store";
import { clone, delay } from "./util";
import { hydrateCorridor } from "./corridor-service";

export function configFromCorridor(partnerId: string, corridor: Corridor): PartnerCorridorConfig {
  return {
    partnerId,
    corridorId: corridor.id,
    enabled: corridor.enabled,
    fxRate: corridor.fxRate,
    serviceChargePct: corridor.serviceChargePct,
    dailyLimit: corridor.dailyLimit,
    monthlyLimit: corridor.monthlyLimit,
    perTxnLimit: corridor.perTxnLimit,
    revenueSharePct: corridor.revenueSharePct,
    settlementFrequency: corridor.settlementFrequency,
    minAmount: corridor.minAmount,
    maxTxnsPerDay: corridor.maxTxnsPerDay,
    allowInward: corridor.allowInward,
    allowOutward: corridor.allowOutward,
  };
}

function mergeConfig(
  partnerId: string,
  corridor: Corridor,
  saved?: PartnerCorridorConfig,
): PartnerCorridorConfig {
  return {
    ...configFromCorridor(partnerId, corridor),
    ...saved,
    partnerId,
    corridorId: corridor.id,
  };
}

function corridorsForPartner(partnerId: string): Corridor[] {
  const partner = readCollection("partners").find((p) => p.id === partnerId);
  const corridors = readCollection("corridors").map(hydrateCorridor);
  if (!partner) return [];
  return corridors.filter(
    (c) =>
      c.sourcePartnerId || c.destinationPartnerId
        ? c.sourcePartnerId === partnerId || c.destinationPartnerId === partnerId
        : c.fromCountry === partner.country || c.toCountry === partner.country,
  );
}

export async function listPartnerCorridorConfigs(
  partnerId: string,
): Promise<{ corridor: Corridor; config: PartnerCorridorConfig }[]> {
  const saved = readCollection("partnerCorridorConfigs");
  const rows = corridorsForPartner(partnerId).map((corridor) => {
    const existing = saved.find((c) => c.partnerId === partnerId && c.corridorId === corridor.id);
    return { corridor, config: mergeConfig(partnerId, corridor, existing) };
  });
  return delay(clone(rows), 350);
}

export async function savePartnerCorridorConfig(
  partnerId: string,
  corridorId: string,
  patch: Partial<PartnerCorridorConfig>,
): Promise<PartnerCorridorConfig> {
  const corridor = readCollection("corridors").map(hydrateCorridor).find((c) => c.id === corridorId);
  if (!corridor) throw new Error("not_found");

  const store = readCollection("partnerCorridorConfigs");
  const idx = store.findIndex((c) => c.partnerId === partnerId && c.corridorId === corridorId);
  const next = mergeConfig(partnerId, corridor, idx === -1 ? undefined : store[idx]);
  const saved: PartnerCorridorConfig = { ...next, ...patch, partnerId, corridorId };
  if (idx === -1) store.push(saved);
  else store[idx] = saved;
  writeCollection("partnerCorridorConfigs", store);
  return delay(clone(saved), 400);
}

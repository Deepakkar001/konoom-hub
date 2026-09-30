import type { Corridor, CountryCode } from "../types";
import { readCollection, writeCollection } from "./browser-store";
import { clone, delay } from "./util";

/** Fills rule fields for corridors saved before those fields existed. */
export function hydrateCorridor(raw: Corridor): Corridor {
  return {
    ...raw,
    minAmount: raw.minAmount ?? 5_000,
    maxTxnsPerDay: raw.maxTxnsPerDay ?? 100,
    allowInward: raw.allowInward ?? true,
    allowOutward: raw.allowOutward ?? true,
  };
}

export type CorridorWriteError = "same_country" | "duplicate" | "not_found";

export async function listCorridors(partnerId?: string): Promise<Corridor[]> {
  let results = readCollection("corridors").map(hydrateCorridor);
  if (partnerId) {
    // A corridor "belongs" to a partner if their country is one of the two ends.
    const partner = readCollection("partners").find((p) => p.id === partnerId);
    if (partner) {
      results = results.filter(
        (c) => c.fromCountry === partner.country || c.toCountry === partner.country,
      );
    }
  }
  return delay(clone(results), 350);
}

export async function getCorridor(id: string): Promise<Corridor | undefined> {
  const found = readCollection("corridors").find((c) => c.id === id);
  return delay(found ? clone(hydrateCorridor(found)) : undefined, 250);
}

export async function createCorridor(
  input: Omit<Corridor, "id">,
): Promise<Corridor> {
  if (input.fromCountry === input.toCountry) {
    throw new Error("same_country");
  }
  const store = readCollection("corridors").map(hydrateCorridor);
  const exists = store.some(
    (c) => c.fromCountry === input.fromCountry && c.toCountry === input.toCountry,
  );
  if (exists) throw new Error("duplicate");

  if (input.sourcePartnerId && input.destinationPartnerId) {
    if (input.sourcePartnerId === input.destinationPartnerId) {
      throw new Error("same_partner");
    }
    const partners = readCollection("partners");
    const sourcePartner = partners.find((partner) => partner.id === input.sourcePartnerId);
    const destinationPartner = partners.find((partner) => partner.id === input.destinationPartnerId);
    if (
      !sourcePartner ||
      !destinationPartner ||
      sourcePartner.country !== input.fromCountry ||
      destinationPartner.country !== input.toCountry
    ) {
      throw new Error("invalid_partner");
    }
  }

  const corridor = hydrateCorridor({
    ...input,
    id: nextCorridorId(input.fromCountry, input.toCountry, store),
  });
  store.unshift(corridor);
  writeCollection("corridors", store);
  return delay(clone(corridor), 450);
}

function nextCorridorId(from: CountryCode, to: CountryCode, store: Corridor[]) {
  const base = `COR-${from}-${to}`;
  if (!store.some((c) => c.id === base)) return base;
  let n = 2;
  while (store.some((c) => c.id === `${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function updateCorridor(
  id: string,
  patch: Partial<Corridor>,
): Promise<Corridor> {
  const store = readCollection("corridors").map(hydrateCorridor);
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("not_found");
  store[idx] = hydrateCorridor({ ...store[idx], ...patch, id });
  writeCollection("corridors", store);
  return delay(clone(store[idx]), 400);
}

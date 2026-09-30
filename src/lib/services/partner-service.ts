import type { Partner, PartnerStatus } from "../types";
import { readCollection, writeCollection } from "./browser-store";
import { clone, delay } from "./util";

export interface PartnerSearchParams {
  query?: string;
  country?: string;
  status?: PartnerStatus;
}

export async function listPartners(
  params: PartnerSearchParams = {},
): Promise<Partner[]> {
  let results = readCollection("partners");
  if (params.query) {
    const q = params.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.legalName.toLowerCase().includes(q),
    );
  }
  if (params.country) results = results.filter((p) => p.country === params.country);
  if (params.status) results = results.filter((p) => p.status === params.status);
  return delay(clone(results), 400);
}

export async function getPartner(id: string): Promise<Partner | undefined> {
  return delay(clone(readCollection("partners").find((p) => p.id === id)), 300);
}

export async function createPartner(
  input: Omit<Partner, "stats" | "status" | "corridors"> & { status?: PartnerStatus },
): Promise<Partner> {
  const partner: Partner = {
    ...input,
    status: input.status ?? "pending",
    corridors: [],
    stats: {
      totalTransactions: 0,
      totalRemittanceValue: 0,
      outstandingSettlement: 0,
      availableLiquidity: 0,
      apiStatus: "offline",
    },
  };
  const store = readCollection("partners");
  store.unshift(partner);
  writeCollection("partners", store);
  return delay(clone(partner), 600);
}

export async function updatePartner(
  id: string,
  patch: Partial<Partner>,
): Promise<Partner> {
  const store = readCollection("partners");
  const idx = store.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("not_found");
  store[idx] = { ...store[idx], ...patch, id };
  writeCollection("partners", store);
  return delay(clone(store[idx]), 450);
}

/** Masked partner credential. A live API would return the secret once and store only a hash. */
export function issueMaskedApiKey() {
  const body = Math.random().toString(36).slice(2, 14).padEnd(12, "0");
  return `ck_${body}…`;
}

export async function updatePartnerAccess(
  id: string,
  patch: Partial<Partner["access"]>,
): Promise<Partner> {
  const store = readCollection("partners");
  const idx = store.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("not_found");
  store[idx] = {
    ...store[idx],
    access: { ...store[idx].access, ...patch },
  };
  writeCollection("partners", store);
  return delay(clone(store[idx]), 450);
}

export async function regeneratePartnerApiKey(id: string): Promise<Partner> {
  return updatePartnerAccess(id, { apiKeyMasked: issueMaskedApiKey() });
}

export async function setPartnerStatus(
  id: string,
  status: PartnerStatus,
): Promise<Partner> {
  return updatePartner(id, { status });
}

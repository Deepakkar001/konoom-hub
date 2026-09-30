import { CORRIDORS, PARTNERS, TRANSACTIONS, WEB_USERS } from "../mock-data";
import type { Corridor, Partner, PartnerCorridorConfig, Transaction, WebUser } from "../types";
import { clone } from "./util";

const PREFIX = "konoom_hub_data_";
const CHANGE_EVENT = "konoom_hub_data_changed";

export type CollectionName = "partners" | "users" | "corridors" | "transactions" | "partnerCorridorConfigs";

type CollectionMap = {
  partners: Partner[];
  users: WebUser[];
  corridors: Corridor[];
  transactions: Transaction[];
  partnerCorridorConfigs: PartnerCorridorConfig[];
};

const SEEDS: CollectionMap = {
  partners: PARTNERS,
  users: WEB_USERS,
  corridors: CORRIDORS,
  transactions: TRANSACTIONS,
  partnerCorridorConfigs: [],
};

function storageKey(collection: CollectionName) {
  return `${PREFIX}${collection}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function readCollection<K extends CollectionName>(
  collection: K,
): CollectionMap[K] {
  if (!canUseStorage()) return clone(SEEDS[collection]);

  const key = storageKey(collection);
  const stored = window.localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as CollectionMap[K];
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  const seeded = clone(SEEDS[collection]);
  window.localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function writeCollection<K extends CollectionName>(
  collection: K,
  value: CollectionMap[K],
) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey(collection), JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent(CHANGE_EVENT, { detail: { collection } }),
  );
}

export function subscribeToDataChanges(listener: () => void) {
  if (!canUseStorage()) return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key?.startsWith(PREFIX)) listener();
  };
  const handleLocalChange = () => listener();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, handleLocalChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, handleLocalChange);
  };
}

export function resetBrowserData() {
  if (!canUseStorage()) return;
  (Object.keys(SEEDS) as CollectionName[]).forEach((collection) => {
    window.localStorage.removeItem(storageKey(collection));
  });
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

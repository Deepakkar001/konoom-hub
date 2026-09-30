import type { WebUser, WebUserRole, WebUserStatus } from "../types";
import { readCollection, writeCollection } from "./browser-store";
import { clone, delay } from "./util";

export async function listUsers(params: {
  role?: WebUserRole;
  partnerId?: string;
  query?: string;
} = {}): Promise<WebUser[]> {
  let results = readCollection("users");
  if (params.role) results = results.filter((u) => u.role === params.role);
  if (params.partnerId)
    results = results.filter((u) => u.partnerId === params.partnerId);
  if (params.query) {
    const q = params.query.toLowerCase();
    results = results.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }
  return delay(clone(results), 350);
}

export async function getUser(id: string): Promise<WebUser | undefined> {
  const found = readCollection("users").find((u) => u.id === id);
  return delay(found ? clone(found) : undefined, 250);
}

export async function createUser(
  input: Omit<WebUser, "id" | "createdAt" | "status"> & { status?: WebUserStatus },
): Promise<WebUser> {
  const user: WebUser = {
    ...input,
    id: `USR-${String(readCollection("users").length + 1).padStart(3, "0")}`,
    status: input.status ?? "invited",
    createdAt: new Date().toISOString(),
  };
  const store = readCollection("users");
  store.unshift(user);
  writeCollection("users", store);
  return delay(clone(user), 500);
}

export async function updateUser(
  id: string,
  patch: Partial<WebUser>,
): Promise<WebUser> {
  const store = readCollection("users");
  const idx = store.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found");
  store[idx] = { ...store[idx], ...patch };
  writeCollection("users", store);
  return delay(clone(store[idx]), 400);
}

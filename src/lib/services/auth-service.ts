import type { SessionUser } from "../types";
import { readCollection } from "./browser-store";
import { delay } from "./util";

export interface LoginPayload {
  email: string;
  password: string;
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "account_disabled"
  | "partner_inactive";

export class AuthError extends Error {
  code: AuthErrorCode;
  vars?: Record<string, string>;

  constructor(
    code: AuthErrorCode,
    message: string,
    vars?: Record<string, string>,
  ) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.vars = vars;
  }
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export async function login(payload: LoginPayload): Promise<SessionUser> {
  const user =
    readCollection("users").find(
      (u) =>
        u.email.toLowerCase() === payload.email.trim().toLowerCase(),
    );

  if (!user) {
    throw new AuthError("invalid_credentials", "Incorrect User ID or password.");
  }
  if (user.status === "disabled") {
    throw new AuthError(
      "account_disabled",
      "This account has been disabled. Contact your administrator.",
    );
  }
  if (!payload.password || payload.password.length < 4) {
    throw new AuthError("invalid_credentials", "Incorrect User ID or password.");
  }

  const partner = user.partnerId
    ? readCollection("partners").find((p) => p.id === user.partnerId)
    : undefined;

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "Hub Admin" ? "hub_admin" : "partner_admin",
    partnerId: user.partnerId,
    avatarInitials: initials(user.name),
  };

  if (partner && partner.status !== "active" && user.role === "Partner Admin") {
    throw new AuthError(
      "partner_inactive",
      `${partner.name} is currently ${partner.status}. Contact Konoom Hub support.`,
      { partner: partner.name, status: partner.status },
    );
  }

  return delay(session, 550);
}

export async function logout(): Promise<void> {
  return delay(undefined, 150);
}

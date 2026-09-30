// ---------------------------------------------------------------------------
// Domain types for the Konoom Central Hub web portal.
//
// These types are the intended shape of the future REST API responses.
// The mock service layer in `lib/services/*` returns exactly these shapes,
// so when the real backend is ready, only the function bodies in
// `lib/services/*` need to change (fetch calls instead of mock lookups) —
// components and pages should not need to change at all.
// ---------------------------------------------------------------------------

export type Role = "hub_admin" | "partner_admin";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  partnerId?: string; // present only for partner_admin
  avatarInitials: string;
}

export type CountryCode = "TD" | "CM" | "CF" | "CG" | "GA" | "GQ" | "CD";

export interface Country {
  code: CountryCode;
  name: string;
  currency: string;
  flag: string; // emoji flag, safe cross-platform placeholder
}

export type PartnerStatus = "active" | "suspended" | "inactive" | "pending";
export type PartnerType =
  | "Mobile Money"
  | "Bank"
  | "MFI"
  | "Payment Aggregator";

export interface Partner {
  id: string; // e.g. KON-CHD-001
  name: string;
  legalName: string;
  legalEntityType: string;
  registrationNo: string;
  description: string;
  country: CountryCode;
  reportingCurrency?: "USD" | "XAF";
  partnerType: PartnerType;
  status: PartnerStatus;
  onboardedDate: string; // ISO date
  contact: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    officePhone?: string;
    address: string;
  };
  access: {
    apiAccessType?: "REST API" | "SOAP" | "SFTP";
    apiKeyMasked: string;
    apiSecretKeyMasked?: string;
    baseUrl: string;
    callbackUrl?: string;
    ipWhitelist?: string;
  };
  settlementBank?: {
    bankName: string;
    accountName: string;
    accountNumberMasked: string;
    swift: string;
  };
  corridors: string[]; // corridor ids this partner participates in
  stats: {
    totalTransactions: number;
    totalRemittanceValue: number; // in USD equivalent for cross-country roll-up
    outstandingSettlement: number;
    availableLiquidity: number;
    apiStatus: "online" | "degraded" | "offline";
  };
}

export interface Corridor {
  id: string;
  fromCountry: CountryCode;
  toCountry: CountryCode;
  sourcePartnerId?: string;
  destinationPartnerId?: string;
  enabled: boolean;
  fxRate: number; // fromCurrency -> toCurrency
  serviceChargePct: number;
  dailyLimit: number;
  monthlyLimit: number;
  perTxnLimit: number;
  revenueSharePct: number;
  settlementFrequency: "Daily" | "Weekly" | "Bi-weekly" | "Monthly";
  /** Minimum sending amount accepted on this corridor. */
  minAmount: number;
  /** Velocity cap: maximum transactions per day. */
  maxTxnsPerDay: number;
  allowInward: boolean;
  allowOutward: boolean;
}

/** Commercial terms for one partner on one corridor. Missing records use the corridor as the starting template. */
export interface PartnerCorridorConfig {
  partnerId: string;
  corridorId: string;
  enabled: boolean;
  fxRate: number;
  serviceChargePct: number;
  dailyLimit: number;
  monthlyLimit: number;
  perTxnLimit: number;
  revenueSharePct: number;
  settlementFrequency: Corridor["settlementFrequency"];
  minAmount: number;
  maxTxnsPerDay: number;
  allowInward: boolean;
  allowOutward: boolean;
}

export type TransactionStatus =
  | "INITIATED"
  | "VALIDATING"
  | "AUTHORIZED"
  | "SENDER_DEBITED"
  | "RECIPIENT_CREDIT_PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED"
  | "PENDING"
  | "TIMEOUT";

export interface Transaction {
  id: string; // Hub Transaction ID e.g. CHD-CMR-20260918-000123
  hubReference: string;
  partnerReference: string;
  settlementReference?: string;
  type: "Outward Remittance" | "Inward Remittance";
  sourcePartnerId: string;
  destinationPartnerId: string;
  senderMobileMasked: string;
  recipientMobileMasked: string;
  senderCountry: CountryCode;
  recipientCountry: CountryCode;
  sendingAmount: number;
  sendingCurrency: string;
  fxRate: number;
  receivingAmount: number;
  receivingCurrency: string;
  serviceCharge: number;
  tax: number;
  totalDebited: number;
  status: TransactionStatus;
  settlementStatus: "Pending" | "Settled" | "Excluded";
  corridorId: string;
  createdAt: string; // ISO datetime
  completedAt?: string;
  timeline: { label: string; timestamp: string; note?: string }[];
}

export type WebUserRole = "Hub Admin" | "Partner Admin";
export type WebUserStatus = "active" | "invited" | "disabled";

export interface WebUser {
  id: string;
  name: string;
  email: string;
  role: WebUserRole;
  partnerId?: string;
  status: WebUserStatus;
  lastLogin?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export type Granularity = "daily" | "weekly" | "monthly";

export interface TrendPoint {
  label: string;
  value: number;
}

export interface HubDashboardStats {
  partnerCount: number;
  totalTransactions: number;
  todaysTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalRemittanceValue: number;
  pendingTransactions: number;
  outstandingSettlement: number;
  availableLiquidity: number;
  activeCorridors: number;
  webUserCount: number;
  trend: Record<Granularity, TrendPoint[]>;
}

export interface PartnerDashboardStats {
  totalTransactions: number;
  todaysTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalRemittanceValue: number;
  pendingTransactions: number;
  outstandingSettlement: number;
  availableLiquidity: number;
  activeCorridors: number;
  apiStatus: "online" | "degraded" | "offline";
  trend: Record<Granularity, TrendPoint[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionFilters {
  query?: string;
  transactionId?: string;
  partnerReference?: string;
  senderMobile?: string;
  recipientMobile?: string;
  senderCountry?: CountryCode;
  recipientCountry?: CountryCode;
  type?: Transaction["type"];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  status?: TransactionStatus;
  corridorId?: string;
  settlementStatus?: Transaction["settlementStatus"];
  partnerId?: string; // scope to one partner (Partner Admin view)
  page?: number;
  pageSize?: number;
}

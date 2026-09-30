import type {
  Granularity,
  HubDashboardStats,
  PartnerDashboardStats,
  TrendPoint,
} from "../types";
import { readCollection } from "./browser-store";
import { delay } from "./util";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildTrend(seedOffset: number): Record<Granularity, TrendPoint[]> {
  // Deterministic, gently varying trend series derived from a seed offset so
  // each partner/the hub gets a distinct-looking but stable chart.
  const wave = (i: number, amp: number, base: number) =>
    Math.round(
      base +
        amp * Math.sin((i + seedOffset) * 0.9) +
        amp * 0.4 * Math.cos((i + seedOffset) * 0.33),
    );

  const daily: TrendPoint[] = DAY_LABELS.map((label, i) => ({
    label,
    value: Math.max(20, wave(i, 140, 420 + seedOffset * 6)),
  }));

  const weekly: TrendPoint[] = Array.from({ length: 8 }, (_, i) => ({
    label: `W${i + 1}`,
    value: Math.max(200, wave(i, 900, 2600 + seedOffset * 30)),
  }));

  const monthly: TrendPoint[] = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
  ].map((label, i) => ({
    label,
    value: Math.max(800, wave(i, 3200, 9800 + seedOffset * 110)),
  }));

  return { daily, weekly, monthly };
}

export async function getHubDashboardStats(): Promise<HubDashboardStats> {
  const corridors = readCollection("corridors");
  const partners = readCollection("partners");
  const transactions = readCollection("transactions");
  const users = readCollection("users");
  const totalTransactions = transactions.length + 84_320; // + historical volume not in the sample window
  const successful = transactions.filter((t) => t.status === "COMPLETED").length;
  const failed = transactions.filter((t) =>
    ["FAILED", "REJECTED", "TIMEOUT"].includes(t.status),
  ).length;
  const pending = transactions.filter((t) =>
    ["PENDING", "RECIPIENT_CREDIT_PENDING", "AUTHORIZED", "SENDER_DEBITED", "VALIDATING", "INITIATED"].includes(
      t.status,
    ),
  ).length;
  const todays = Math.max(
    11,
    transactions.filter((t) => t.createdAt.slice(0, 10) === "2026-09-26").length,
  );

  const stats: HubDashboardStats = {
    partnerCount: partners.length,
    totalTransactions,
    todaysTransactions: todays,
    successfulTransactions: successful,
    failedTransactions: failed,
    pendingTransactions: pending,
    totalRemittanceValue: partners.reduce(
      (s, p) => s + p.stats.totalRemittanceValue,
      0,
    ),
    outstandingSettlement: partners.reduce(
      (s, p) => s + p.stats.outstandingSettlement,
      0,
    ),
    availableLiquidity: partners.reduce(
      (s, p) => s + p.stats.availableLiquidity,
      0,
    ),
    activeCorridors: corridors.filter((c) => c.enabled).length,
    webUserCount: users.length,
    trend: buildTrend(0),
  };
  return delay(stats, 450);
}

export async function getPartnerDashboardStats(
  partnerId: string,
): Promise<PartnerDashboardStats> {
  const partners = readCollection("partners");
  const transactions = readCollection("transactions");
  const partner = partners.find((p) => p.id === partnerId);
  if (!partner) throw new Error("Partner not found");

  const partnerTxns = transactions.filter(
    (t) =>
      t.sourcePartnerId === partnerId || t.destinationPartnerId === partnerId,
  );
  const successful = partnerTxns.filter((t) => t.status === "COMPLETED").length;
  const failed = partnerTxns.filter((t) =>
    ["FAILED", "REJECTED", "TIMEOUT"].includes(t.status),
  ).length;
  const pending = partnerTxns.filter((t) =>
    ["PENDING", "RECIPIENT_CREDIT_PENDING", "AUTHORIZED", "SENDER_DEBITED", "VALIDATING", "INITIATED"].includes(
      t.status,
    ),
  ).length;
  const todays = partnerTxns.filter(
    (t) => t.createdAt.slice(0, 10) === "2026-09-26",
  ).length;

  const seedOffset = partner.id.charCodeAt(4) % 7;

  const stats: PartnerDashboardStats = {
    totalTransactions: partner.stats.totalTransactions,
    todaysTransactions: todays,
    successfulTransactions: successful,
    failedTransactions: failed,
    pendingTransactions: pending,
    totalRemittanceValue: partner.stats.totalRemittanceValue,
    outstandingSettlement: partner.stats.outstandingSettlement,
    availableLiquidity: partner.stats.availableLiquidity,
    activeCorridors: partner.corridors.length,
    apiStatus: partner.stats.apiStatus,
    trend: buildTrend(seedOffset),
  };
  return delay(stats, 450);
}

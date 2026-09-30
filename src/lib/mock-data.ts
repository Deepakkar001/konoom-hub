import type {
  AuditEvent,
  Corridor,
  Country,
  CountryCode,
  Partner,
  Transaction,
  TransactionStatus,
  WebUser,
} from "./types";

// Deterministic PRNG (mulberry32) — same output on server & client, every run.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260918);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

export const COUNTRIES: Country[] = [
  { code: "TD", name: "Chad", currency: "XAF", flag: "🇹🇩" },
  { code: "CM", name: "Cameroon", currency: "XAF", flag: "🇨🇲" },
  { code: "CF", name: "Central African Republic", currency: "XAF", flag: "🇨🇫" },
  { code: "CG", name: "Congo", currency: "XAF", flag: "🇨🇬" },
  { code: "GA", name: "Gabon", currency: "XAF", flag: "🇬🇦" },
  { code: "GQ", name: "Equatorial Guinea", currency: "XAF", flag: "🇬🇶" },
  { code: "CD", name: "DR Congo", currency: "CDF", flag: "🇨🇩" },
];

export const countryByCode = (code: CountryCode) =>
  COUNTRIES.find((c) => c.code === code)!;

export const PARTNERS: Partner[] = [
  {
    id: "KON-CHD-001",
    name: "Konoom Wallet - Chad",
    legalName: "Konoom Wallet Chad SARL",
    legalEntityType: "Private Limited Company",
    registrationNo: "RC-CHD-12345",
    description:
      "Digital wallet and remittance services provider in Chad enabling cross-border transactions through Central Hub.",
    country: "TD",
    partnerType: "Mobile Money",
    status: "active",
    onboardedDate: "2026-06-02",
    contact: {
      name: "John Doe",
      designation: "Partnership Manager",
      email: "john.doe@konoom.td",
      phone: "+235 661234567",
      officePhone: "+235 661234568",
      address: "BP 1234, N'Djamena, Chad",
    },
    access: {
      apiAccessType: "REST API",
      apiKeyMasked: "ck_7f9a2b4e8c6d…",
      apiSecretKeyMasked: "sk_9b82a71f4c2…",
      baseUrl: "https://api.konoom.td/v1",
      callbackUrl: "https://hub.central.com/callback",
      ipWhitelist: "192.168.1.10, 192.168.1.11",
    },
    settlementBank: {
      bankName: "Commercial Bank Tchad",
      accountName: "Konoom Wallet Chad SARL",
      accountNumberMasked: "•••• •••• 4471",
      swift: "CBTDTDND",
    },
    corridors: ["COR-TD-CM"],
    stats: {
      totalTransactions: 8421,
      totalRemittanceValue: 612_430_000,
      outstandingSettlement: 18_240_000,
      availableLiquidity: 94_600_000,
      apiStatus: "online",
    },
  },
  {
    id: "KON-CMR-001",
    name: "Konoom Wallet - Cameroon",
    legalName: "Konoom Wallet Cameroon PLC",
    legalEntityType: "Public Limited Company",
    registrationNo: "RC-CMR-88213",
    description:
      "Mobile money and remittance operator serving Cameroon, integrated with Central Hub for CEMAC settlement.",
    country: "CM",
    partnerType: "Mobile Money",
    status: "active",
    onboardedDate: "2026-06-02",
    contact: {
      name: "Amina Fotso",
      designation: "Head of Partnerships",
      email: "amina.fotso@konoom.cm",
      phone: "+237 677889900",
      address: "Rue Joss, Douala, Cameroon",
    },
    access: {
      apiAccessType: "REST API",
      apiKeyMasked: "ck_1a2f88de91cc…",
      apiSecretKeyMasked: "sk_8a2fd4c92b1…",
      baseUrl: "https://api.konoom.cm/v1",
      callbackUrl: "https://hub.central.com/callback",
      ipWhitelist: "41.202.11.4",
    },
    settlementBank: {
      bankName: "Afriland First Bank",
      accountName: "Konoom Wallet Cameroon PLC",
      accountNumberMasked: "•••• •••• 8820",
      swift: "CCEICMCX",
    },
    corridors: ["COR-TD-CM", "COR-CM-GA"],
    stats: {
      totalTransactions: 11_204,
      totalRemittanceValue: 845_120_000,
      outstandingSettlement: 22_950_000,
      availableLiquidity: 131_800_000,
      apiStatus: "online",
    },
  },
  {
    id: "KON-GAB-001",
    name: "Konoom Wallet - Gabon",
    legalName: "Konoom Wallet Gabon SA",
    legalEntityType: "Société Anonyme",
    registrationNo: "RC-GAB-55190",
    description:
      "Wallet and merchant payment provider in Gabon, onboarded for the second phase of CEMAC corridor expansion.",
    country: "GA",
    partnerType: "Mobile Money",
    status: "active",
    onboardedDate: "2026-07-14",
    contact: {
      name: "Pierre Ndong",
      designation: "Operations Director",
      email: "pierre.ndong@konoom.ga",
      phone: "+241 06122334",
      address: "Boulevard Triomphal, Libreville, Gabon",
    },
    access: {
      apiAccessType: "REST API",
      apiKeyMasked: "ck_9c3d15aa22ff…",
      apiSecretKeyMasked: "sk_6f1218d303e…",
      baseUrl: "https://api.konoom.ga/v1",
      ipWhitelist: "154.68.22.9",
    },
    settlementBank: {
      bankName: "BGFIBank Gabon",
      accountName: "Konoom Wallet Gabon SA",
      accountNumberMasked: "•••• •••• 3391",
      swift: "BGFIGALX",
    },
    corridors: ["COR-CM-GA"],
    stats: {
      totalTransactions: 2_918,
      totalRemittanceValue: 204_600_000,
      outstandingSettlement: 6_120_000,
      availableLiquidity: 41_200_000,
      apiStatus: "degraded",
    },
  },
  {
    id: "KON-COG-001",
    name: "Konoom Wallet - Congo",
    legalName: "Konoom Wallet Congo SARLU",
    legalEntityType: "Private Limited Company",
    registrationNo: "RC-COG-40218",
    description:
      "Partner under commercial and compliance review ahead of go-live on the Central Hub network.",
    country: "CG",
    partnerType: "Bank",
    status: "pending",
    onboardedDate: "2026-09-01",
    contact: {
      name: "Grace Mbemba",
      designation: "Compliance Lead",
      email: "grace.mbemba@konoom.cg",
      phone: "+242 06455778",
      address: "Avenue de la Paix, Brazzaville, Congo",
    },
    access: {
      apiAccessType: "REST API",
      apiKeyMasked: "ck_pending…",
      apiSecretKeyMasked: "sk_pending…",
      baseUrl: "https://api.konoom.cg/v1",
    },
    corridors: [],
    stats: {
      totalTransactions: 0,
      totalRemittanceValue: 0,
      outstandingSettlement: 0,
      availableLiquidity: 0,
      apiStatus: "offline",
    },
  },
  {
    id: "KON-CAF-001",
    name: "Konoom Wallet - CAR",
    legalName: "Konoom Wallet Centrafrique SA",
    legalEntityType: "Société Anonyme",
    registrationNo: "RC-CAF-11024",
    description:
      "Suspended pending renewal of local mobile money licence; corridor access disabled.",
    country: "CF",
    partnerType: "Mobile Money",
    status: "suspended",
    onboardedDate: "2026-05-20",
    contact: {
      name: "Serge Bangui",
      designation: "Country Manager",
      email: "serge.bangui@konoom.cf",
      phone: "+236 70223344",
      address: "Avenue Boganda, Bangui, CAR",
    },
    access: {
      apiAccessType: "REST API",
      apiKeyMasked: "ck_a02fe610bd41…",
      apiSecretKeyMasked: "sk_a4f21e75d9a…",
      baseUrl: "https://api.konoom.cf/v1",
    },
    corridors: [],
    stats: {
      totalTransactions: 1_204,
      totalRemittanceValue: 58_900_000,
      outstandingSettlement: 2_410_000,
      availableLiquidity: 9_800_000,
      apiStatus: "offline",
    },
  },
];

export const CORRIDORS: Corridor[] = [
  {
    id: "COR-TD-CM",
    fromCountry: "TD",
    toCountry: "CM",
    enabled: true,
    fxRate: 1.0,
    serviceChargePct: 2.0,
    dailyLimit: 5_000_000,
    monthlyLimit: 60_000_000,
    perTxnLimit: 1_500_000,
    revenueSharePct: 30,
    settlementFrequency: "Daily",
    minAmount: 5_000,
    maxTxnsPerDay: 200,
    allowInward: true,
    allowOutward: true,
  },
  {
    id: "COR-CM-GA",
    fromCountry: "CM",
    toCountry: "GA",
    enabled: true,
    fxRate: 1.0,
    serviceChargePct: 2.5,
    dailyLimit: 3_000_000,
    monthlyLimit: 40_000_000,
    perTxnLimit: 1_000_000,
    revenueSharePct: 25,
    settlementFrequency: "Weekly",
    minAmount: 5_000,
    maxTxnsPerDay: 150,
    allowInward: true,
    allowOutward: true,
  },
  {
    id: "COR-TD-GA",
    fromCountry: "TD",
    toCountry: "GA",
    enabled: false,
    fxRate: 1.0,
    serviceChargePct: 2.5,
    dailyLimit: 2_000_000,
    monthlyLimit: 25_000_000,
    perTxnLimit: 800_000,
    revenueSharePct: 25,
    settlementFrequency: "Weekly",
    minAmount: 5_000,
    maxTxnsPerDay: 80,
    allowInward: true,
    allowOutward: false,
  },
];

const STATUS_WEIGHTS: [TransactionStatus, number][] = [
  ["COMPLETED", 62],
  ["PENDING", 8],
  ["RECIPIENT_CREDIT_PENDING", 6],
  ["FAILED", 7],
  ["REJECTED", 3],
  ["CANCELLED", 3],
  ["REFUNDED", 3],
  ["TIMEOUT", 3],
  ["AUTHORIZED", 3],
  ["SENDER_DEBITED", 2],
];
function weightedStatus(): TransactionStatus {
  const total = STATUS_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [status, w] of STATUS_WEIGHTS) {
    if (r < w) return status;
    r -= w;
  }
  return "COMPLETED";
}

function maskMobile(country: CountryCode) {
  const n = randInt(100000, 999999);
  return `${country === "TD" ? "+235" : "+237"} XXXX${String(n).slice(-2)}`;
}

function buildTimeline(status: TransactionStatus, createdAt: Date) {
  const steps: { label: string; offsetMin: number; note?: string }[] = [
    { label: "Transaction Initiated", offsetMin: 0 },
    { label: "Validation Passed", offsetMin: 0.2 },
    { label: "Authorized", offsetMin: 0.4 },
    { label: "Sender Wallet Debited", offsetMin: 0.6 },
  ];
  if (status === "COMPLETED") {
    steps.push({ label: "Recipient Wallet Credited", offsetMin: 0.9 });
    steps.push({ label: "Ledger Posted & Receipt Issued", offsetMin: 1.1 });
  } else if (
    status === "FAILED" ||
    status === "REJECTED" ||
    status === "TIMEOUT"
  ) {
    steps.push({
      label: `Transaction ${status === "TIMEOUT" ? "Timed Out" : status === "REJECTED" ? "Rejected" : "Failed"}`,
      offsetMin: 0.9,
      note: "Sender debit reversed — no hub obligation created.",
    });
  } else if (status === "REFUNDED") {
    steps.push({
      label: "Recipient Credit Failed",
      offsetMin: 0.9,
      note: "Fallback disbursement window expired.",
    });
    steps.push({ label: "Sender Refunded", offsetMin: 1.4 });
  } else if (status === "RECIPIENT_CREDIT_PENDING") {
    steps.push({
      label: "Awaiting Recipient Wallet Credit",
      offsetMin: 0.9,
      note: "Recipient not yet registered — held in suspense account.",
    });
  } else if (status === "CANCELLED") {
    steps.push({ label: "Cancelled by Sender", offsetMin: 0.5 });
  }
  return steps.map((s) => ({
    label: s.label,
    timestamp: new Date(
      createdAt.getTime() + s.offsetMin * 60_000,
    ).toISOString(),
    note: s.note,
  }));
}

function genTransactions(count: number): Transaction[] {
  const list: Transaction[] = [];
  const now = new Date("2026-09-26T09:00:00Z").getTime();
  for (let i = 0; i < count; i++) {
    const corridor = pick(CORRIDORS.filter((c) => c.enabled));
    const reverse = rand() > 0.5;
    const senderCountry = reverse ? corridor.toCountry : corridor.fromCountry;
    const recipientCountry = reverse
      ? corridor.fromCountry
      : corridor.toCountry;
    const sourcePartner = PARTNERS.find((p) => p.country === senderCountry)!;
    const destPartner = PARTNERS.find((p) => p.country === recipientCountry)!;
    const status = weightedStatus();
    const daysAgo = randInt(0, 12);
    const minsAgo = randInt(0, 1439);
    const createdAt = new Date(now - daysAgo * 86_400_000 - minsAgo * 60_000);
    const sendingAmount = randInt(5, 800) * 1000;
    const serviceCharge = Math.round(
      sendingAmount * (corridor.serviceChargePct / 100),
    );
    const tax = Math.round(serviceCharge * 0.25);
    const seq = String(50000 + i);
    const id = `${senderCountry}-${recipientCountry}-${createdAt
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${seq}`;
    list.push({
      id,
      hubReference: `HUB-${seq}${randInt(100, 999)}`,
      partnerReference: `KON-${seq}${randInt(100, 999)}`,
      settlementReference:
        status === "COMPLETED" ? `SET-${seq}${randInt(10, 99)}` : undefined,
      type: "Outward Remittance",
      sourcePartnerId: sourcePartner.id,
      destinationPartnerId: destPartner.id,
      senderMobileMasked: maskMobile(senderCountry),
      recipientMobileMasked: maskMobile(recipientCountry),
      senderCountry,
      recipientCountry,
      sendingAmount,
      sendingCurrency: countryByCode(senderCountry).currency,
      fxRate: corridor.fxRate,
      receivingAmount: Math.round(sendingAmount * corridor.fxRate),
      receivingCurrency: countryByCode(recipientCountry).currency,
      serviceCharge,
      tax,
      totalDebited: sendingAmount + serviceCharge + tax,
      status,
      settlementStatus:
        status === "COMPLETED"
          ? rand() > 0.2
            ? "Settled"
            : "Pending"
          : "Excluded",
      corridorId: corridor.id,
      createdAt: createdAt.toISOString(),
      completedAt:
        status === "COMPLETED"
          ? new Date(createdAt.getTime() + 70_000).toISOString()
          : undefined,
      timeline: buildTimeline(status, createdAt),
    });
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const TRANSACTIONS: Transaction[] = genTransactions(140);

export const WEB_USERS: WebUser[] = [
  {
    id: "USR-001",
    name: "Michael Adeyemi",
    email: "michael@konoom.com",
    role: "Hub Admin",
    status: "active",
    lastLogin: "2026-09-26T07:41:00Z",
    createdAt: "2026-05-10T09:00:00Z",
  },
  {
    id: "USR-002",
    name: "Sarah Konan",
    email: "sarah@konoom.com",
    role: "Hub Admin",
    status: "active",
    lastLogin: "2026-09-25T16:02:00Z",
    createdAt: "2026-05-10T09:00:00Z",
  },
  {
    id: "USR-003",
    name: "John Doe",
    email: "john@konoom.td",
    role: "Partner Admin",
    partnerId: "KON-CHD-001",
    status: "active",
    lastLogin: "2026-09-26T06:15:00Z",
    createdAt: "2026-06-02T10:00:00Z",
  },
  {
    id: "USR-004",
    name: "Amina",
    email: "amina@konoom.cm",
    role: "Partner Admin",
    partnerId: "KON-CMR-001",
    status: "active",
    lastLogin: "2026-09-24T11:22:00Z",
    createdAt: "2026-06-02T10:00:00Z",
  },
  {
    id: "USR-005",
    name: "Pierre Ndong",
    email: "pierre.ndong@konoom.ga",
    role: "Partner Admin",
    partnerId: "KON-GAB-001",
    status: "invited",
    createdAt: "2026-07-14T14:30:00Z",
  },
  {
    id: "USR-006",
    name: "Grace Mbemba",
    email: "grace.mbemba@konoom.cg",
    role: "Partner Admin",
    partnerId: "KON-COG-001",
    status: "invited",
    createdAt: "2026-09-01T09:00:00Z",
  },
];

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "AUD-1001",
    actor: "Michael Adeyemi",
    action: "Activated corridor",
    target: "COR-CM-GA",
    timestamp: "2026-09-20T10:12:00Z",
  },
  {
    id: "AUD-1002",
    actor: "Sarah Konan",
    action: "Updated service charge to 2.0%",
    target: "COR-TD-CM",
    timestamp: "2026-09-18T15:03:00Z",
  },
  {
    id: "AUD-1003",
    actor: "Michael Adeyemi",
    action: "Suspended partner",
    target: "KON-CAF-001",
    timestamp: "2026-09-12T09:45:00Z",
  },
  {
    id: "AUD-1004",
    actor: "Sarah Konan",
    action: "Registered new partner",
    target: "KON-COG-001",
    timestamp: "2026-09-01T09:05:00Z",
  },
  {
    id: "AUD-1005",
    actor: "John Doe",
    action: "Exported transaction report",
    target: "Sept 2026 — KON-CHD-001",
    timestamp: "2026-09-25T08:20:00Z",
  },
];

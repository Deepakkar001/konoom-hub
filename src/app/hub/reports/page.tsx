"use client";

import { useState } from "react";
import { FileBarChart2, Download, Building2, Landmark, ShieldCheck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { MessageKey } from "@/lib/i18n/messages";

type ReportRow = {
  reference: string;
  partner: string;
  corridor: string;
  amount: number;
  status: string;
  date: string;
};

type ReportDefinition = {
  icon: typeof FileBarChart2;
  title: MessageKey;
  description: MessageKey;
  totals: { label: MessageKey; value: string; tone?: "positive" | "neutral" }[];
  rows: ReportRow[];
};

const REPORTS: ReportDefinition[] = [
  {
    icon: FileBarChart2,
    title: "reports.txn.title",
    description: "reports.txn.desc",
    totals: [
      { label: "reports.preview.totalVolume", value: "$4.26M", tone: "positive" },
      { label: "reports.preview.approved", value: "96.8%", tone: "positive" },
      { label: "reports.preview.lastSynced", value: "Today, 09:30", tone: "neutral" },
    ],
    rows: [
      { reference: "TXN-10981", partner: "Konoom Chad", corridor: "TD→CM", amount: 182500, status: "Settled", date: "2026-09-29" },
      { reference: "TXN-10972", partner: "Konoom Cameroon", corridor: "CM→GA", amount: 274300, status: "Approved", date: "2026-09-29" },
      { reference: "TXN-10953", partner: "Konoom Gabon", corridor: "GA→CG", amount: 96000, status: "Queued", date: "2026-09-28" },
      { reference: "TXN-10934", partner: "Konoom Congo", corridor: "CG→TD", amount: 148000, status: "Reviewed", date: "2026-09-28" },
    ],
  },
  {
    icon: Building2,
    title: "reports.partner.title",
    description: "reports.partner.desc",
    totals: [
      { label: "reports.preview.totalVolume", value: "$6.04M", tone: "positive" },
      { label: "reports.preview.approved", value: "91.2%", tone: "positive" },
      { label: "reports.preview.lastSynced", value: "Yesterday", tone: "neutral" },
    ],
    rows: [
      { reference: "PART-204", partner: "Konoom Cameroon", corridor: "CM→GA", amount: 1200000, status: "Healthy", date: "2026-09-28" },
      { reference: "PART-198", partner: "Konoom Chad", corridor: "TD→CM", amount: 980000, status: "Healthy", date: "2026-09-28" },
      { reference: "PART-184", partner: "Konoom Gabon", corridor: "GA→CG", amount: 640000, status: "Watchlist", date: "2026-09-27" },
      { reference: "PART-169", partner: "Konoom Congo", corridor: "CG→TD", amount: 420000, status: "Pending", date: "2026-09-27" },
    ],
  },
  {
    icon: Landmark,
    title: "reports.settle.title",
    description: "reports.settle.desc",
    totals: [
      { label: "reports.preview.totalVolume", value: "$2.81M", tone: "positive" },
      { label: "reports.preview.settlementReady", value: "$1.92M", tone: "positive" },
      { label: "reports.preview.lastSynced", value: "Today, 08:45 ", tone: "neutral" },
    ],
    rows: [
      { reference: "SET-441", partner: "Central Hub", corridor: "TD→CM", amount: 760000, status: "Queued", date: "2026-09-29" },
      { reference: "SET-438", partner: "Central Hub", corridor: "CM→GA", amount: 540000, status: "Settled", date: "2026-09-29" },
      { reference: "SET-430", partner: "Central Hub", corridor: "GA→CG", amount: 410000, status: "Settled", date: "2026-09-28" },
      { reference: "SET-426", partner: "Central Hub", corridor: "CG→TD", amount: 310000, status: "Processing", date: "2026-09-28" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "reports.aml.title",
    description: "reports.aml.desc",
    totals: [
      { label: "reports.preview.totalVolume", value: "$1.18M", tone: "neutral" },
      { label: "reports.preview.approved", value: "12 alerts", tone: "neutral" },
      { label: "reports.preview.lastSynced", value: "Today, 07:50 ", tone: "neutral" },
    ],
    rows: [
      { reference: "AML-561", partner: "Konoom Chad", corridor: "TD→CM", amount: 92000, status: "Flagged", date: "2026-09-29" },
      { reference: "AML-547", partner: "Konoom Cameroon", corridor: "CM→GA", amount: 68000, status: "Cleared", date: "2026-09-29" },
      { reference: "AML-532", partner: "Konoom Gabon", corridor: "GA→CG", amount: 47000, status: "Escalated", date: "2026-09-28" },
      { reference: "AML-520", partner: "Konoom Congo", corridor: "CG→TD", amount: 35000, status: "Reviewed", date: "2026-09-28" },
    ],
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

function buildCsv(rows: ReportRow[]) {
  const headers = ["Reference", "Partner", "Corridor", "Amount", "Status", "Date"];
  const csvRows = rows.map((row) =>
    [row.reference, row.partner, row.corridor, formatCurrency(row.amount), row.status, row.date]
      .map(csvEscape)
      .join(","),
  );

  return [headers.map(csvEscape).join(","), ...csvRows].join("\n");
}

export default function ReportsPage() {
  const { push } = useToast();
  const { t } = useI18n();
  const [selectedReport, setSelectedReport] = useState<MessageKey>("reports.txn.title");

  const activeReport = REPORTS.find((report) => report.title === selectedReport) ?? REPORTS[0];

  const generateReport = (reportTitle: MessageKey) => {
    setSelectedReport(reportTitle);
  };

  const downloadSample = () => {
    const csv = buildCsv(activeReport.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${t(activeReport.title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-sample.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);

    push("info", `${t(activeReport.title)} sample report downloaded.`);
  };

  return (
    <div>
      <Topbar title={t("reports.title")} subtitle={t("reports.subtitle")} />

      <div className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            const isActive = report.title === selectedReport;

            return (
              <Card key={report.title} className={`p-5 transition-all ${isActive ? "border-blue-200 bg-blue-50/30 shadow-sm" : ""}`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <h4 className="mt-3 text-[14px] font-semibold text-text-primary">{t(report.title)}</h4>
                <p className="mt-1 text-[13px] text-text-secondary">{t(report.description)}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className={`mt-4 ${isActive ? "border-blue-200 bg-blue-50 text-text-primary" : ""}`}
                  onClick={() => generateReport(report.title)}
                >
                  <Download className="h-3.5 w-3.5" /> {t("common.generate")}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary">{t("reports.preview.title")}</p>
              <h3 className="mt-1 text-[18px] font-semibold text-text-primary">{t(activeReport.title)}</h3>
            </div>

            <Button size="sm" variant="secondary" onClick={downloadSample}>
              <Download className="h-3.5 w-3.5" /> {t("reports.preview.download")}
            </Button>
          </div>

          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {activeReport.totals.map((total) => (
                <div key={total.label} className="rounded-xl border border-border bg-surface-sunken p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary">{t(total.label)}</p>
                  <p className={`mt-2 text-[20px] font-semibold ${total.tone === "positive" ? "text-success-700" : "text-text-primary"}`}>
                    {total.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
                <thead>
                  <tr className="text-text-secondary">
                    <th className="border-b border-border px-3 py-2 font-medium">{t("reports.preview.reference")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("reports.preview.partner")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("reports.preview.corridor")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("reports.preview.amount")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("reports.preview.status")}</th>
                    <th className="border-b border-border px-3 py-2 font-medium">{t("reports.preview.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReport.rows.map((row) => (
                    <tr key={row.reference} className="text-text-primary">
                      <td className="border-b border-border px-3 py-2 font-medium">{row.reference}</td>
                      <td className="border-b border-border px-3 py-2">{row.partner}</td>
                      <td className="border-b border-border px-3 py-2">{row.corridor}</td>
                      <td className="border-b border-border px-3 py-2">{formatCurrency(row.amount)}</td>
                      <td className="border-b border-border px-3 py-2">
                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="border-b border-border px-3 py-2">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Granularity, TrendPoint } from "@/lib/types";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { MessageKey } from "@/lib/i18n/messages";

const TABS: { key: Granularity; label: MessageKey }[] = [
  { key: "daily", label: "dash.daily" },
  { key: "weekly", label: "dash.weekly" },
  { key: "monthly", label: "dash.monthly" },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  const { t } = useI18n();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-navy-950 px-3 py-2 text-white shadow-lg">
      <p className="text-[11px] text-white/60">{label}</p>
      <p className="text-sm font-semibold tabular-nums">
        {t("common.txns", { value: formatCompact(payload[0].value) })}
      </p>
    </div>
  );
}

export function TrendChart({
  data,
  defaultGranularity = "daily",
}: {
  data: Record<Granularity, TrendPoint[]>;
  defaultGranularity?: Granularity;
}) {
  const { t } = useI18n();
  const [granularity, setGranularity] = useState<Granularity>(
    defaultGranularity,
  );
  const series = data[granularity];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-surface-sunken p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setGranularity(tab.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                granularity === tab.key
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f5ce0" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2f5ce0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e2e5ea" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8a93a3", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8a93a3", fontSize: 12 }}
              tickFormatter={(v) => formatCompact(v)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd1db" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2f5ce0"
              strokeWidth={2}
              fill="url(#trendFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

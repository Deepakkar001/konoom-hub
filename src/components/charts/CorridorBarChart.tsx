"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCompact } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";

const COLORS = ["#2f5ce0", "#e3a72e", "#157a4a", "#0c1d3b"];

export function CorridorBarChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const { t } = useI18n();
  return (
    <div className="h-56 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#e2e5ea" />
          <XAxis
            type="number"
            tickFormatter={(v) => formatCompact(v)}
            tick={{ fill: "#8a93a3", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#101828", fontSize: 12.5 }}
            axisLine={false}
            tickLine={false}
            width={96}
          />
          <Tooltip
            cursor={{ fill: "#f4f5f7" }}
            formatter={(v) => [t("common.txns", { value: formatCompact(Number(v)) }), ""]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e5ea",
              fontSize: 12.5,
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

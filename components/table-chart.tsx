"use client";

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function parseNumeric(cell: string): number | null {
  const cleaned = cell.trim().replace(/[%,]/g, "");
  if (/^-?\d+(\.\d+)?$/.test(cleaned)) return parseFloat(cleaned);
  // A clean range like "37-45" or "37–45" -> chart its lower bound.
  const range = cleaned.match(/^(-?\d+(?:\.\d+)?)\s*[-–]\s*-?\d+(?:\.\d+)?$/);
  return range ? parseFloat(range[1]) : null;
}

/**
 * A table is chart-worthy only when every non-label column is a clean number/percentage/range
 * in every row (2-6 columns, 2-12 rows) — anything with descriptive/mixed-text cells stays
 * table-only rather than forcing a misleading chart. Verified against the real study-guide
 * tables before shipping: only a handful actually qualify (STAR*D remission rates, personality
 * disorder prevalence, etc.) — that's correct, not every table should become a chart.
 */
export function getChartData(columns: string[], rows: string[][]) {
  if (columns.length < 2 || columns.length > 6 || rows.length < 2 || rows.length > 12) return null;
  const seriesNames = columns.slice(1);
  const data: Array<Record<string, string | number>> = [];
  for (const row of rows) {
    const point: Record<string, string | number> = { label: row[0] };
    for (let i = 0; i < seriesNames.length; i++) {
      const value = parseNumeric(row[i + 1]);
      if (value === null) return null;
      point[seriesNames[i]] = value;
    }
    data.push(point);
  }
  return { data, seriesNames };
}

export function TableChart({ data, seriesNames }: { data: Array<Record<string, string | number>>; seriesNames: string[] }) {
  const config = Object.fromEntries(
    seriesNames.map((name, i) => [name, { label: name, color: SERIES_COLORS[i % SERIES_COLORS.length] }])
  );
  return (
    <ChartContainer config={config} className="max-h-72 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={160} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {seriesNames.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {seriesNames.map((name, i) => (
          <Bar key={name} dataKey={name} fill={SERIES_COLORS[i % SERIES_COLORS.length]} radius={3} />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

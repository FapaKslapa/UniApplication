"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BROWSER_COLORS } from "@/components/admin/stats/chartConstants";
import { ChartCard } from "@/components/admin/stats/StatsPrimitives";
import type { RouterOutputs } from "@/lib/api";

type TopPages = RouterOutputs["stats"]["getTopPages"] | undefined;
type BrowserDist = RouterOutputs["stats"]["getBrowserDistribution"] | undefined;

interface PagesBrowserChartsProps {
  topPages: TopPages;
  maxPageCount: number;
  browserDist: BrowserDist;
  browserTotal: number;
  axisColor: string;
}

export function PagesBrowserCharts({
  topPages,
  maxPageCount,
  browserDist,
  browserTotal,
  axisColor,
}: PagesBrowserChartsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      <ChartCard title="Pagine Top">
        <div className="space-y-4">
          {(topPages ?? []).map((page, i) => (
            <div key={page.path}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-muted-foreground/60 w-4 shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground flex-1 truncate min-w-0">
                  {page.path}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {page.unique} unici
                </span>
                <span className="text-xs font-bold shrink-0">{page.count}</span>
              </div>
              <div className="h-1 rounded-full bg-muted ml-6">
                <div
                  className="h-full rounded-full bg-violet-500/60"
                  style={{
                    width: `${(page.count / maxPageCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Browser">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            layout="vertical"
            data={browserDist ?? []}
            margin={{ left: 0 }}
          >
            <YAxis
              type="category"
              dataKey="browser"
              width={58}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: axisColor }}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: axisColor }}
              width={24}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg bg-popover p-3 text-popover-foreground elevation-1">
                    <p className="text-xs font-bold">
                      {payload[0]?.payload?.browser}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {Number(payload[0]?.value).toLocaleString()}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {(browserDist ?? []).map((entry, i) => (
                <Cell
                  key={entry.browser}
                  fill={BROWSER_COLORS[i % BROWSER_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
          {(browserDist ?? []).map((b, i) => (
            <div key={b.browser} className="flex items-center gap-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: BROWSER_COLORS[i % BROWSER_COLORS.length],
                }}
              />
              <span className="text-[11px] text-muted-foreground truncate flex-1 min-w-0">
                {b.browser}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {browserTotal > 0
                  ? ((b.count / browserTotal) * 100).toFixed(0)
                  : 0}
                %
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

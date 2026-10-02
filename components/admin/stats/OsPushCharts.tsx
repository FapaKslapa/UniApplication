"use client";

import { Bell } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { OS_COLORS } from "@/components/admin/stats/chartConstants";
import { ChartCard } from "@/components/admin/stats/StatsPrimitives";
import type { RouterOutputs } from "@/lib/api";

type OsDist = RouterOutputs["stats"]["getOsDistribution"] | undefined;
type PushStats = RouterOutputs["stats"]["getPushStats"] | undefined;

interface OsPushChartsProps {
  osDist: OsDist;
  osTotal: number;
  axisColor: string;
  pushStats: PushStats;
}

export function OsPushCharts({
  osDist,
  osTotal,
  axisColor,
  pushStats,
}: OsPushChartsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      <ChartCard title="Sistema Operativo">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart layout="vertical" data={osDist ?? []} margin={{ left: 0 }}>
            <YAxis
              type="category"
              dataKey="os"
              width={62}
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
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
                    <p className="text-xs font-bold">
                      {payload[0]?.payload?.os}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {Number(payload[0]?.value).toLocaleString()} ·{" "}
                      {osTotal > 0
                        ? ((Number(payload[0]?.value) / osTotal) * 100).toFixed(
                            1,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {(osDist ?? []).map((entry, i) => (
                <Cell key={entry.os} fill={OS_COLORS[i % OS_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Push Notifications">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl px-4 py-4 flex-1">
            <Bell className="w-5 h-5 text-violet-500 shrink-0" />
            <div>
              <p className="text-2xl font-extrabold tracking-tighter text-zinc-900 dark:text-white">
                {(pushStats?.total ?? 0).toLocaleString("it-IT")}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
                Iscrizioni attive
              </p>
            </div>
          </div>
        </div>

        {(pushStats?.topCourses ?? []).length > 0 && (
          <div className="space-y-3">
            <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              Top corsi iscritti
            </p>
            {(pushStats?.topCourses ?? []).slice(0, 5).map((c, i) => {
              const maxCount = pushStats?.topCourses[0]?.count ?? 1;
              return (
                <div key={c.linkId}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-300 dark:text-zinc-600 w-4 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 flex-1 truncate min-w-0">
                      {c.linkId}
                    </span>
                    <span className="text-xs font-bold font-mono shrink-0">
                      {c.count}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-zinc-100/40 dark:bg-zinc-800/40 ml-6">
                    <div
                      className="h-full rounded-full bg-violet-500/40"
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

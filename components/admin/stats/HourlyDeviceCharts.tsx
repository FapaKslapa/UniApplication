"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEVICE_COLORS } from "@/components/admin/stats/chartConstants";
import { deviceIcon } from "@/components/admin/stats/deviceIcon";
import { ChartCard } from "@/components/admin/stats/StatsPrimitives";
import type { RouterOutputs } from "@/lib/api";

type DeviceDist = RouterOutputs["stats"]["getDeviceDistribution"] | undefined;

interface HourlyDeviceChartsProps {
  activeDays: number;
  hourlyData: { hour: number; count: number }[];
  axisColor: string;
  gridColor: string;
  primaryStroke: string;
  deviceDist: DeviceDist;
  deviceTotal: number;
}

export function HourlyDeviceCharts({
  activeDays,
  hourlyData,
  axisColor,
  gridColor,
  primaryStroke,
  deviceDist,
  deviceTotal,
}: HourlyDeviceChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-5 sm:gap-6">
      <ChartCard
        title={`Orari di Accesso (ultimi ${activeDays}g, ora IT)`}
        className="lg:col-span-4"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData} margin={{ left: -10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: axisColor }}
              tickFormatter={(v) => `${v}h`}
              interval={3}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: axisColor }}
              width={28}
            />
            <Tooltip
              cursor={{ fill: gridColor, radius: 6 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
                    <p className="text-[10px] font-mono text-zinc-400">
                      Ore {payload[0]?.payload?.hour}:00
                    </p>
                    <p className="text-sm font-bold">
                      {payload[0]?.value} visite
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              fill={primaryStroke}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Dispositivi" className="lg:col-span-3">
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={deviceDist ?? []}
                dataKey="count"
                nameKey="deviceType"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                strokeWidth={0}
              >
                {(deviceDist ?? []).map((entry, i) => (
                  <Cell
                    key={entry.deviceType}
                    fill={DEVICE_COLORS[i % DEVICE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0];
                  return (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
                      <p className="text-xs font-bold capitalize">{d?.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {Number(d?.value).toLocaleString()} ·{" "}
                        {deviceTotal > 0
                          ? ((Number(d?.value) / deviceTotal) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-1">
          {(deviceDist ?? []).map((d, i) => (
            <div key={d.deviceType} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: DEVICE_COLORS[i % DEVICE_COLORS.length],
                }}
              />
              <div className="text-zinc-400">{deviceIcon(d.deviceType)}</div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize flex-1">
                {d.deviceType}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {deviceTotal > 0
                  ? ((d.count / deviceTotal) * 100).toFixed(1)
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

"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DATE_PRESETS } from "@/components/admin/stats/chartConstants";
import {
  ChartCard,
  CustomLineTooltip,
  DatePickerButton,
  SkeletonCard,
} from "@/components/admin/stats/StatsPrimitives";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface VisitsTrendChartProps {
  activeDays: number;
  setActiveDays: (days: number) => void;
  axisColor: string;
  gridColor: string;
  primaryStroke: string;
}

export function VisitsTrendChart({
  activeDays,
  setActiveDays,
  axisColor,
  gridColor,
  primaryStroke,
}: VisitsTrendChartProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const dailyInput = useMemo(() => {
    if (showCustom && customFrom && customTo) {
      return {
        from: customFrom.toISOString().split("T")[0],
        to: customTo.toISOString().split("T")[0],
      };
    }
    return { days: activeDays };
  }, [showCustom, customFrom, customTo, activeDays]);

  const { data: dailyStats, isLoading: loadingDaily } =
    api.stats.getDailyStats.useQuery(dailyInput);

  const lineTickInterval = useMemo(() => {
    if (activeDays <= 7) return 0;
    if (activeDays <= 14) return 1;
    if (activeDays <= 30) return 4;
    return 13;
  }, [activeDays]);

  return (
    <ChartCard title="Andamento Visite">
      <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-6">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => {
              setActiveDays(p.days);
              setShowCustom(false);
            }}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-bold font-mono transition-colors",
              !showCustom && activeDays === p.days
                ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className={cn(
            "px-3 py-1.5 rounded-full text-[11px] font-bold font-mono transition-colors",
            showCustom
              ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
          )}
        >
          Personalizzato
        </button>
        {showCustom && (
          <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            <DatePickerButton
              date={customFrom}
              placeholder="Dal"
              open={fromOpen}
              onOpenChange={setFromOpen}
              onSelect={setCustomFrom}
              disabledFn={customTo ? (d) => d > customTo : undefined}
            />
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <DatePickerButton
              date={customTo}
              placeholder="Al"
              open={toOpen}
              onOpenChange={setToOpen}
              onSelect={setCustomTo}
              disabledFn={customFrom ? (d) => d < customFrom : undefined}
            />
          </div>
        )}
      </div>
      {loadingDaily ? (
        <SkeletonCard className="h-[260px] sm:h-[300px]" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={dailyStats ?? []}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: axisColor }}
              interval={lineTickInterval}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                })
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: axisColor }}
              width={30}
            />
            <Tooltip content={<CustomLineTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={primaryStroke}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="uniqueClients"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-0.5 rounded-full"
            style={{ background: primaryStroke }}
          />
          <span className="text-[10px] font-mono text-zinc-400">
            Visite totali
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 border-t-2 border-dashed border-[#a78bfa]" />
          <span className="text-[10px] font-mono text-zinc-400">
            Utenti unici
          </span>
        </div>
      </div>
    </ChartCard>
  );
}

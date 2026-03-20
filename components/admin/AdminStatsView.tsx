"use client";

import { useQueryClient } from "@tanstack/react-query";
import { it } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Clock,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const DEVICE_COLORS = ["#a78bfa", "#34d399", "#fb923c", "#60a5fa"];
const BROWSER_COLORS = [
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#60a5fa",
  "#f472b6",
  "#38bdf8",
  "#facc15",
  "#4ade80",
];
const OS_COLORS = [
  "#60a5fa",
  "#f472b6",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#38bdf8",
  "#facc15",
  "#4ade80",
  "#e879f9",
  "#94a3b8",
];
const DATE_PRESETS = [
  { label: "7g", days: 7 },
  { label: "14g", days: 14 },
  { label: "30g", days: 30 },
  { label: "90g", days: 90 },
];

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
        up
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/15 text-red-600 dark:text-red-400",
      )}
    >
      {up ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  trend?: number | null;
}) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 leading-tight flex-1 pr-2">
          {title}
        </p>
        <div className={cn("p-2 rounded-xl shrink-0", iconColor)}>{icon}</div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-zinc-900 dark:text-white mb-1">
        {value.toLocaleString("it-IT")}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[10px] text-zinc-400 font-medium">{subtitle}</p>
        {trend !== undefined && <TrendBadge value={trend ?? null} />}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-5 sm:p-6 shadow-sm",
        className,
      )}
    >
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-5 sm:mb-6">
        {title}
      </p>
      {children}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-zinc-200/40 dark:bg-zinc-800/40 animate-pulse rounded-[2rem]",
        className,
      )}
    />
  );
}

function CustomLineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
      <p className="text-[10px] font-mono text-zinc-400 mb-2">
        {label
          ? new Date(label).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "short",
            })
          : ""}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 dark:text-white">
            {p.value.toLocaleString()}
          </span>
          <span className="text-[10px] text-zinc-400">
            {p.name === "count"
              ? "visite"
              : p.name === "unique"
                ? "IP unici"
                : "utenti"}
          </span>
        </div>
      ))}
    </div>
  );
}

function DatePickerButton({
  date,
  placeholder,
  open,
  onOpenChange,
  onSelect,
  disabledFn,
}: {
  date: Date | undefined;
  placeholder: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (d: Date | undefined) => void;
  disabledFn?: (date: Date) => boolean;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all whitespace-nowrap min-w-[72px]"
        >
          <CalendarDays className="w-3 h-3 text-zinc-400 shrink-0" />
          {date
            ? date.toLocaleDateString("it-IT", {
                day: "numeric",
                month: "short",
              })
            : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onSelect(d);
            onOpenChange(false);
          }}
          disabled={disabledFn}
          locale={it}
          className="font-mono"
        />
      </PopoverContent>
    </Popover>
  );
}

export function AdminStatsView() {
  const isDark = useIsDark();
  const queryClient = useQueryClient();
  const axisColor = isDark ? "oklch(0.55 0 0)" : "oklch(0.55 0 0)";
  const gridColor = isDark ? "oklch(0.25 0 0 / 0.4)" : "oklch(0.88 0 0 / 0.6)";
  const primaryStroke = isDark ? "oklch(0.95 0 0)" : "oklch(0.12 0 0)";

  const [activeDays, setActiveDays] = useState(30);
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dailyInput = useMemo(() => {
    if (showCustom && customFrom && customTo) {
      return {
        from: customFrom.toISOString().split("T")[0],
        to: customTo.toISOString().split("T")[0],
      };
    }
    return { days: activeDays };
  }, [showCustom, customFrom, customTo, activeDays]);

  const { data: overview, isLoading: loadingOverview } =
    api.stats.getOverview.useQuery();
  const { data: activeUsers } = api.stats.getActiveUsers.useQuery();
  const { data: dailyStats, isLoading: loadingDaily } =
    api.stats.getDailyStats.useQuery(dailyInput);
  const { data: hourlyVisits } = api.stats.getHourlyVisits.useQuery({
    days: activeDays,
  });
  const { data: deviceDist } = api.stats.getDeviceDistribution.useQuery();
  const { data: osDist } = api.stats.getOsDistribution.useQuery();
  const { data: topPages } = api.stats.getTopPages.useQuery();
  const { data: browserDist } = api.stats.getBrowserDistribution.useQuery();
  const { data: pushStats } = api.stats.getPushStats.useQuery();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setIsRefreshing(false);
  }, [queryClient]);

  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyVisits?.find((h) => h.hour === i)?.count ?? 0,
    }));
  }, [hourlyVisits]);

  const deviceTotal = useMemo(
    () => deviceDist?.reduce((a, d) => a + d.count, 0) ?? 0,
    [deviceDist],
  );
  const browserTotal = useMemo(
    () => browserDist?.reduce((a, b) => a + b.count, 0) ?? 0,
    [browserDist],
  );
  const osTotal = useMemo(
    () => osDist?.reduce((a, o) => a + o.count, 0) ?? 0,
    [osDist],
  );
  const maxPageCount = useMemo(() => topPages?.[0]?.count ?? 1, [topPages]);

  const lineTickInterval = useMemo(() => {
    if (activeDays <= 7) return 0;
    if (activeDays <= 14) return 1;
    if (activeDays <= 30) return 4;
    return 13;
  }, [activeDays]);

  const deviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
    if (type === "tablet") return <Tablet className="w-3.5 h-3.5" />;
    return <Monitor className="w-3.5 h-3.5" />;
  };

  if (loadingOverview) {
    return (
      <div className="space-y-6 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {["sk-a", "sk-b", "sk-c", "sk-d"].map((k) => (
            <SkeletonCard key={k} className="h-28 sm:h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["sk-e", "sk-f", "sk-g"].map((k) => (
            <SkeletonCard key={k} className="h-28" />
          ))}
        </div>
        <SkeletonCard className="h-80" />
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <SkeletonCard className="lg:col-span-4 h-64" />
          <SkeletonCard className="lg:col-span-3 h-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Header con refresh */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
          Analytics
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={cn("w-3 h-3", isRefreshing && "animate-spin")}
          />
          Aggiorna
        </button>
      </div>

      {/* Visite KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Visite Totali"
          value={overview?.totalVisits ?? 0}
          subtitle="Dall'inizio"
          icon={<Activity className="w-4 h-4" />}
          iconColor="bg-violet-500/10 text-violet-500"
        />
        <StatCard
          title="Ultime 24h"
          value={overview?.last24h ?? 0}
          subtitle="vs giorno prima"
          icon={<Clock className="w-4 h-4" />}
          iconColor="bg-emerald-500/10 text-emerald-500"
          trend={overview?.trend24h}
        />
        <StatCard
          title="Questa Settimana"
          value={overview?.thisWeek ?? 0}
          subtitle="vs sett. prima"
          icon={<BarChart3 className="w-4 h-4" />}
          iconColor="bg-blue-500/10 text-blue-500"
          trend={overview?.trendWeek}
        />
        <StatCard
          title="Utenti Unici"
          value={overview?.totalClients ?? overview?.totalUnique ?? 0}
          subtitle={`${overview?.clientsToday ?? overview?.uniqueToday ?? 0} oggi`}
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* DAU / WAU / MAU */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Attivi Oggi (DAU)"
          value={activeUsers?.dau ?? 0}
          subtitle={`${activeUsers?.newToday ?? 0} nuovi oggi`}
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-cyan-500/10 text-cyan-500"
          trend={activeUsers?.trendDau}
        />
        <StatCard
          title="Attivi 7gg (WAU)"
          value={activeUsers?.wau ?? 0}
          subtitle="ultimi 7 giorni"
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-indigo-500/10 text-indigo-500"
          trend={activeUsers?.trendWau}
        />
        <StatCard
          title="Attivi 30gg (MAU)"
          value={activeUsers?.mau ?? 0}
          subtitle={`di ${(activeUsers?.total ?? 0).toLocaleString("it-IT")} totali`}
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-pink-500/10 text-pink-500"
          trend={activeUsers?.trendMau}
        />
      </div>

      {/* Andamento visite */}
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
                "px-3 py-1.5 rounded-full text-[11px] font-bold font-mono transition-all",
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
              "px-3 py-1.5 rounded-full text-[11px] font-bold font-mono transition-all",
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

      {/* Orari + Dispositivi */}
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
                        <p className="text-xs font-bold capitalize">
                          {d?.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {Number(d?.value).toLocaleString()} ·{" "}
                          {deviceTotal > 0
                            ? ((Number(d?.value) / deviceTotal) * 100).toFixed(
                                1,
                              )
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

      {/* Pagine Top + Browser */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <ChartCard title="Pagine Top">
          <div className="space-y-4">
            {(topPages ?? []).map((page, i) => (
              <div key={page.path}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-300 dark:text-zinc-600 w-4 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex-1 truncate min-w-0">
                    {page.path}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                    {page.unique} unici
                  </span>
                  <span className="text-xs font-bold font-mono shrink-0">
                    {page.count}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-zinc-100/40 dark:bg-zinc-800/40 ml-6">
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
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
                      <p className="text-xs font-bold">
                        {payload[0]?.payload?.browser}
                      </p>
                      <p className="text-[10px] text-zinc-400">
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
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate flex-1 min-w-0">
                  {b.browser}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">
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

      {/* OS + Push Notifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <ChartCard title="Sistema Operativo">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              layout="vertical"
              data={osDist ?? []}
              margin={{ left: 0 }}
            >
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
                          ? (
                              (Number(payload[0]?.value) / osTotal) *
                              100
                            ).toFixed(1)
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
    </motion.div>
  );
}

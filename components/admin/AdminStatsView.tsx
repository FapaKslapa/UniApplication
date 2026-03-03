"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Globe,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; payload: Record<string, unknown> }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          {payload[0].value}{" "}
          <span className="text-[10px] font-normal opacity-50 uppercase tracking-tighter">
            richieste
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function AdminStatsView() {
  const { data: stats } = api.analytics.getStats.useQuery();
  const { data: dailyRequests } = api.analytics.getDailyRequests.useQuery();
  const { data: hourlyRequests } =
    api.analytics.getHourlyRequestsToday.useQuery();
  const { data: topEndpoints } = api.analytics.getTopEndpoints.useQuery();

  const processedDailyData = useMemo(() => {
    if (!dailyRequests) return [];
    return dailyRequests.map((d) => ({
      date: new Date(d.date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
      }),
      richieste: d.count,
    }));
  }, [dailyRequests]);

  const processedHourlyData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      richieste: hourlyRequests?.find((h) => h.hour === i)?.count || 0,
    }));
  }, [hourlyRequests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utenti"
          value={stats?.totalUsers || 0}
          icon={<Users className="h-4 w-4" />}
          color="blue"
          subtitle="Totali registrati"
        />
        <StatCard
          title="Oggi"
          value={stats?.activeToday || 0}
          icon={<Activity className="h-4 w-4" />}
          color="green"
          subtitle="Utenti attivi"
        />
        <StatCard
          title="Richieste"
          value={stats?.totalRequests || 0}
          icon={<Globe className="h-4 w-4" />}
          color="purple"
          subtitle="Traffico API"
        />
        <StatCard
          title="Carico"
          value={stats?.requestsToday || 0}
          icon={<BarChart3 className="h-4 w-4" />}
          color="orange"
          subtitle="Nelle ultime 24h"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection
          title="Richieste (30gg)"
          icon={<Calendar className="h-4 w-4 text-blue-500" />}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedDailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#88888820"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888888" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="richieste"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#3b82f6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>

        <ChartSection
          title="Orario di Picco"
          icon={<Clock className="h-4 w-4 text-orange-500" />}
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedHourlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#88888820"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888888" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="richieste" radius={[4, 4, 0, 0]}>
                  {processedHourlyData.map((_entry, index) => (
                    <Cell
                      key={`cell-${_entry.hour}`}
                      fill={index % 2 === 0 ? "#f97316" : "#f9731680"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>
      </div>

      <ChartSection
        title="Endpoint Popolari"
        icon={<BarChart3 className="h-4 w-4 text-purple-500" />}
      >
        <div className="space-y-4">
          {topEndpoints?.map((endpoint) => (
            <div key={endpoint.endpoint} className="group">
              <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-tight">
                  {endpoint.endpoint}
                </span>
                <span className="text-[10px] font-mono font-bold">
                  {endpoint.count}
                </span>
              </div>
              <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 h-2 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(endpoint.count / (topEndpoints[0]?.count || 1)) * 100}%`,
                  }}
                  className="bg-purple-500 h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </ChartSection>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle: string;
}) {
  const cMap: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20",
    green:
      "from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400 border-green-500/20",
    purple:
      "from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20",
    orange:
      "from-orange-500/10 to-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500/20",
  };
  return (
    <div
      className={cn(
        "relative p-6 rounded-[2rem] border bg-gradient-to-br transition-all hover:scale-[1.02] overflow-hidden group shadow-sm",
        cMap[color],
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/50 dark:bg-black/20 rounded-xl shadow-sm">
            {icon}
          </div>
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-60">
            {title}
          </span>
        </div>
        <p className="text-3xl font-bold font-mono tracking-tighter mb-1">
          {value.toLocaleString()}
        </p>
        <p className="text-[9px] font-mono font-bold uppercase tracking-tighter opacity-40">
          {subtitle}
        </p>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  );
}

function ChartSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-6 lg:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
          {icon}
        </div>
        <h2 className="text-sm font-bold font-serif uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

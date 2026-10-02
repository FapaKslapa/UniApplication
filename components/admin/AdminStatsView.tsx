"use client";

import { useQueryClient } from "@tanstack/react-query";
import { m } from "framer-motion";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { StatsKpiGrids } from "@/components/admin/stats/StatsKpiGrids";
import { StatsLoadingSkeleton } from "@/components/admin/stats/StatsLoadingSkeleton";
import { SkeletonCard } from "@/components/admin/stats/StatsPrimitives";
import { useIsDark } from "@/components/admin/stats/useIsDark";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const VisitsTrendChart = dynamic(
  () =>
    import("@/components/admin/stats/VisitsTrendChart").then(
      (m) => m.VisitsTrendChart,
    ),
  { ssr: false, loading: () => <SkeletonCard className="h-80" /> },
);

const HourlyDeviceCharts = dynamic(
  () =>
    import("@/components/admin/stats/HourlyDeviceCharts").then(
      (m) => m.HourlyDeviceCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <SkeletonCard className="lg:col-span-4 h-64" />
        <SkeletonCard className="lg:col-span-3 h-64" />
      </div>
    ),
  },
);

const PagesBrowserCharts = dynamic(
  () =>
    import("@/components/admin/stats/PagesBrowserCharts").then(
      (m) => m.PagesBrowserCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
    ),
  },
);

const OsPushCharts = dynamic(
  () =>
    import("@/components/admin/stats/OsPushCharts").then((m) => m.OsPushCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
    ),
  },
);

export function AdminStatsView() {
  const isDark = useIsDark();
  const queryClient = useQueryClient();
  const axisColor = isDark ? "oklch(0.55 0 0)" : "oklch(0.55 0 0)";
  const gridColor = isDark ? "oklch(0.25 0 0 / 0.4)" : "oklch(0.88 0 0 / 0.6)";
  const primaryStroke = isDark ? "oklch(0.95 0 0)" : "oklch(0.12 0 0)";

  const [activeDays, setActiveDays] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: overview, isLoading: loadingOverview } =
    api.stats.getOverview.useQuery();
  const { data: activeUsers } = api.stats.getActiveUsers.useQuery();
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
    try {
      await queryClient.invalidateQueries();
    } finally {
      setIsRefreshing(false);
    }
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

  if (loadingOverview) {
    return <StatsLoadingSkeleton />;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
          Analytics
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("w-3 h-3", isRefreshing && "animate-spin")}
          />
          Aggiorna
        </button>
      </div>

      <StatsKpiGrids overview={overview} activeUsers={activeUsers} />

      <VisitsTrendChart
        activeDays={activeDays}
        setActiveDays={setActiveDays}
        axisColor={axisColor}
        gridColor={gridColor}
        primaryStroke={primaryStroke}
      />

      <HourlyDeviceCharts
        activeDays={activeDays}
        hourlyData={hourlyData}
        axisColor={axisColor}
        gridColor={gridColor}
        primaryStroke={primaryStroke}
        deviceDist={deviceDist}
        deviceTotal={deviceTotal}
      />

      <PagesBrowserCharts
        topPages={topPages}
        maxPageCount={maxPageCount}
        browserDist={browserDist}
        browserTotal={browserTotal}
        axisColor={axisColor}
      />

      <OsPushCharts
        osDist={osDist}
        osTotal={osTotal}
        axisColor={axisColor}
        pushStats={pushStats}
      />
    </m.div>
  );
}

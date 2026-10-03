import { Activity, BarChart3, Clock, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stats/StatsPrimitives";
import type { RouterOutputs } from "@/lib/api";

type Overview = RouterOutputs["stats"]["getOverview"] | undefined;
type ActiveUsers = RouterOutputs["stats"]["getActiveUsers"] | undefined;

interface StatsKpiGridsProps {
  overview: Overview;
  activeUsers: ActiveUsers;
}

export function StatsKpiGrids({ overview, activeUsers }: StatsKpiGridsProps) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Visite Totali"
          value={overview?.totalVisits ?? 0}
          subtitle="Dall'inizio"
          icon={<Activity className="w-4 h-4" />}
          iconColor="bg-muted text-foreground"
        />
        <StatCard
          title="Ultime 24h"
          value={overview?.last24h ?? 0}
          subtitle="vs giorno prima"
          icon={<Clock className="w-4 h-4" />}
          iconColor="bg-muted text-foreground"
          trend={overview?.trend24h}
        />
        <StatCard
          title="Questa Settimana"
          value={overview?.thisWeek ?? 0}
          subtitle="vs sett. prima"
          icon={<BarChart3 className="w-4 h-4" />}
          iconColor="bg-muted text-foreground"
          trend={overview?.trendWeek}
        />
        <StatCard
          title="Utenti Unici"
          value={overview?.totalClients ?? overview?.totalUnique ?? 0}
          subtitle={`${overview?.clientsToday ?? overview?.uniqueToday ?? 0} oggi`}
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-muted text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Attivi Oggi (DAU)"
          value={activeUsers?.dau ?? 0}
          subtitle={`${activeUsers?.newToday ?? 0} nuovi oggi`}
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-muted text-foreground"
          trend={activeUsers?.trendDau}
        />
        <StatCard
          title="Attivi 7gg (WAU)"
          value={activeUsers?.wau ?? 0}
          subtitle="ultimi 7 giorni"
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-muted text-foreground"
          trend={activeUsers?.trendWau}
        />
        <StatCard
          title="Attivi 30gg (MAU)"
          value={activeUsers?.mau ?? 0}
          subtitle={`di ${(activeUsers?.total ?? 0).toLocaleString("it-IT")} totali`}
          icon={<Users className="w-4 h-4" />}
          iconColor="bg-muted text-foreground"
          trend={activeUsers?.trendMau}
        />
      </div>
    </>
  );
}

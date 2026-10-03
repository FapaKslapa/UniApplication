import { createTRPCRouter } from "@/server/api/trpc";
import { getActiveUsers } from "./active-users";
import {
  getBrowserDistribution,
  getDeviceDistribution,
  getOsDistribution,
  getTopPages,
} from "./distributions";
import { getOverview } from "./overview";
import { getPushStats } from "./push-stats";
import { getDailyStats, getHourlyVisits } from "./time-series";
import { trackVisit } from "./track-visit";

export const statsRouter = createTRPCRouter({
  trackVisit,
  getOverview,
  getActiveUsers,
  getDailyStats,
  getHourlyVisits,
  getDeviceDistribution,
  getOsDistribution,
  getTopPages,
  getBrowserDistribution,
  getPushStats,
});

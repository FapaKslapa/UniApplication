import type { inferRouterOutputs } from "@trpc/server";
import type { DateTime } from "luxon";
import type { AppRouter } from "@/server/api/root";

export type MonthEvent =
  inferRouterOutputs<AppRouter>["orario"]["getMonthlyOrario"][number];

export type MonthDay = {
  date: DateTime;
  isCurrentMonth: boolean;
};

export type MonthTab = "calendar" | "filters";

export type MonthLayoutProps = {
  currentDate: DateTime;
  direction: number;
  days: MonthDay[];
  eventsByDate: Map<string, MonthEvent[]>;
  eventCount: number;
  isFetching: boolean;
  isCurrentMonth: boolean;
  activeTab: MonthTab;
  onTabChange: (tab: MonthTab) => void;
  materie: string[];
  hiddenSubjects: string[];
  colorFor: (materia: string) => string;
  onToggleSubject: (materia: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onOpenDay: (date: DateTime, events: MonthEvent[]) => void;
};

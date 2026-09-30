import type { DateTime } from "luxon";
import { AdminArea } from "@/components/home/AdminArea";
import { AgendaLayout } from "@/components/home/AgendaLayout";
import { MonthLayout } from "@/components/home/MonthLayout";
import { NotConfigured } from "@/components/home/NotConfigured";
import type { HomeView } from "@/components/home/types";
import type { AgendaMode, AgendaSource } from "@/lib/agenda/types";
import type { DaySchedule } from "@/lib/orario-utils";

type HomeBodyProps = {
  activeView: HomeView;
  hasConfigured: boolean;
  isProfessor: boolean;
  source: AgendaSource;
  title: string;
  selectedDate: DateTime;
  agendaMode: AgendaMode;
  materiaColorMap: Record<string, string>;
  onSelectedDateChange: (date: DateTime) => void;
  onAgendaModeChange: (mode: AgendaMode) => void;
  onOpenDay: (day: DaySchedule) => void;
  onViewChange: (view: HomeView) => void;
  onConfigure: () => void;
};

export function HomeBody({
  activeView,
  hasConfigured,
  isProfessor,
  source,
  title,
  selectedDate,
  agendaMode,
  materiaColorMap,
  onSelectedDateChange,
  onAgendaModeChange,
  onOpenDay,
  onViewChange,
  onConfigure,
}: HomeBodyProps) {
  if (activeView === "stats" || activeView === "admin-courses") {
    return <AdminArea activeView={activeView} onViewChange={onViewChange} />;
  }
  if (!hasConfigured) {
    return (
      <NotConfigured isProfessor={isProfessor} onConfigure={onConfigure} />
    );
  }
  if (activeView === "week") {
    return (
      <AgendaLayout
        selectedDate={selectedDate}
        mode={agendaMode}
        source={source}
        title={title}
        onSelectedDateChange={onSelectedDateChange}
        onModeChange={onAgendaModeChange}
      />
    );
  }
  return (
    <MonthLayout materiaColorMap={materiaColorMap} onOpenDay={onOpenDay} />
  );
}

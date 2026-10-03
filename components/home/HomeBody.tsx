import type { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { AgendaLayout } from "@/components/home/AgendaLayout";
import { DocentiLayout } from "@/components/home/DocentiLayout";
import { NotConfigured } from "@/components/home/NotConfigured";
import type { HomeView } from "@/components/home/types";
import type { AgendaMode } from "@/lib/agenda/types";

const AdminArea = dynamic(() =>
  import("@/components/home/AdminArea").then((mod) => mod.AdminArea),
);

type HomeBodyProps = {
  activeView: HomeView;
  hasConfigured: boolean;
  title: string;
  selectedDate: DateTime;
  agendaMode: AgendaMode;
  onSelectedDateChange: (date: DateTime) => void;
  onAgendaModeChange: (mode: AgendaMode) => void;
  onViewChange: (view: HomeView) => void;
  onConfigure: () => void;
  onRefresh: () => void;
};

export function HomeBody({
  activeView,
  hasConfigured,
  title,
  selectedDate,
  agendaMode,
  onSelectedDateChange,
  onAgendaModeChange,
  onViewChange,
  onConfigure,
  onRefresh,
}: HomeBodyProps) {
  if (activeView === "stats" || activeView === "admin-courses") {
    return <AdminArea activeView={activeView} onViewChange={onViewChange} />;
  }
  if (activeView === "docenti") {
    return <DocentiLayout />;
  }
  if (!hasConfigured) {
    return <NotConfigured onConfigure={onConfigure} />;
  }
  return (
    <AgendaLayout
      selectedDate={selectedDate}
      mode={agendaMode}
      source={{ kind: "courses" }}
      title={title}
      onSelectedDateChange={onSelectedDateChange}
      onModeChange={onAgendaModeChange}
      onRefresh={onRefresh}
    />
  );
}

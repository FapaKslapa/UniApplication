import type { DateTime } from "luxon";
import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import type { AgendaMode, AgendaSource } from "@/lib/agenda/types";

type AgendaLayoutProps = {
  selectedDate: DateTime;
  mode: AgendaMode;
  source: AgendaSource;
  title: string;
  onSelectedDateChange: (date: DateTime) => void;
  onModeChange: (mode: AgendaMode) => void;
  onRefresh: () => void;
};

export function AgendaLayout({
  selectedDate,
  mode,
  source,
  title,
  onSelectedDateChange,
  onModeChange,
  onRefresh,
}: AgendaLayoutProps) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col md:max-w-md">
      <AgendaScreen
        selectedDate={selectedDate}
        mode={mode}
        source={source}
        title={title}
        onSelectedDateChange={onSelectedDateChange}
        onModeChange={onModeChange}
        onRefresh={onRefresh}
      />
    </div>
  );
}

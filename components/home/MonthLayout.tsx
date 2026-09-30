import { MonthlyView } from "@/components/MonthlyView";
import type { DaySchedule } from "@/lib/orario-utils";

type MonthLayoutProps = {
  materiaColorMap: Record<string, string>;
  onOpenDay: (day: DaySchedule) => void;
};

export function MonthLayout({ materiaColorMap, onOpenDay }: MonthLayoutProps) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col md:max-w-md">
      <MonthlyView onDaySelect={onOpenDay} materiaColorMap={materiaColorMap} />
    </div>
  );
}

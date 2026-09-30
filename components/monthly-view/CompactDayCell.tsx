import type { DateTime } from "luxon";
import { uniqueSubjects } from "@/components/monthly-view/monthGrid";
import { SubjectDots } from "@/components/monthly-view/SubjectDots";
import type { MonthDay, MonthEvent } from "@/components/monthly-view/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CompactDayCellProps = {
  day: MonthDay;
  events: MonthEvent[];
  isSelected: boolean;
  isToday: boolean;
  colorFor: (materia: string) => string;
  onSelect: (date: DateTime) => void;
};

export function CompactDayCell({
  day,
  events,
  isSelected,
  isToday,
  colorFor,
  onSelect,
}: CompactDayCellProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(day.date)}
      className={cn(
        "relative h-auto min-h-11 flex-col items-center justify-between rounded-sm px-0 py-1.5",
        !day.isCurrentMonth && "pointer-events-none opacity-0",
        isSelected &&
          "z-10 scale-105 bg-foreground text-background elevation-1 hover:bg-foreground/90",
        isToday && !isSelected && "ring-1 ring-foreground",
      )}
    >
      <span
        className={cn(
          "text-[10px] font-bold leading-none",
          !isSelected && "text-muted-foreground",
        )}
      >
        {day.date.day}
      </span>
      <SubjectDots
        materie={uniqueSubjects(events)}
        colorFor={colorFor}
        inverted={isSelected}
      />
    </Button>
  );
}

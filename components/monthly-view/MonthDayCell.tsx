import type { DateTime } from "luxon";
import { uniqueSubjects } from "@/components/monthly-view/monthGrid";
import { SubjectDots } from "@/components/monthly-view/SubjectDots";
import type { MonthDay, MonthEvent } from "@/components/monthly-view/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MonthDayCellProps = {
  day: MonthDay;
  events: MonthEvent[];
  isToday: boolean;
  colorFor: (materia: string) => string;
  onOpen: (date: DateTime, events: MonthEvent[]) => void;
};

export function MonthDayCell({
  day,
  events,
  isToday,
  colorFor,
  onOpen,
}: MonthDayCellProps) {
  const hasEvents = events.length > 0;

  return (
    <Button
      variant="ghost"
      disabled={!hasEvents}
      onClick={() => onOpen(day.date, events)}
      className={cn(
        "relative h-auto min-h-[58px] w-full flex-col items-center justify-between rounded-md px-0 py-2.5 disabled:opacity-100 lg:min-h-[80px] lg:py-3",
        !day.isCurrentMonth && "pointer-events-none opacity-0",
        !isToday && !hasEvents && "bg-muted/50",
        !isToday && hasEvents && "bg-card elevation-1",
        isToday && "bg-foreground text-background hover:bg-foreground/90",
        isToday && hasEvents && "elevation-2",
      )}
    >
      <span
        className={cn(
          "text-xs font-bold leading-none lg:text-sm",
          !isToday && !hasEvents && "text-muted-foreground/50",
        )}
      >
        {day.date.day}
      </span>
      <SubjectDots
        materie={uniqueSubjects(events)}
        colorFor={colorFor}
        inverted={isToday}
        large
      />
    </Button>
  );
}

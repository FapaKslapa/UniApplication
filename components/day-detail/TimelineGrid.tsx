import type { ReactNode } from "react";
import { HALF_HOUR_HEIGHT } from "@/components/day-detail/dayLayout";
import { cn } from "@/lib/utils";

type TimelineGridProps = {
  startHour: number;
  endHour: number;
  children: ReactNode;
};

function buildSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const label = hour.toString().padStart(2, "0");
    slots.push(`${label}:00`, `${label}:30`);
  }
  return slots;
}

export function TimelineGrid({
  startHour,
  endHour,
  children,
}: TimelineGridProps) {
  const slots = buildSlots(startHour, endHour);

  return (
    <div className="flex gap-2">
      <div className="w-10 shrink-0">
        {slots.map((slot) => (
          <div
            key={slot}
            className="flex items-center justify-end pr-1 text-xs font-semibold tabular-nums text-muted-foreground"
            style={{ height: HALF_HOUR_HEIGHT }}
          >
            {slot.endsWith(":00") ? slot : ""}
          </div>
        ))}
      </div>

      <div className="relative flex-1">
        {slots.map((slot, index) => (
          <div
            key={slot}
            className={cn(
              "absolute w-full border-t",
              slot.endsWith(":00")
                ? "border-border"
                : "border-dashed border-border/50",
            )}
            style={{ top: index * HALF_HOUR_HEIGHT }}
          />
        ))}
        {children}
      </div>
    </div>
  );
}

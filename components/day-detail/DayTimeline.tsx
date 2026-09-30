import {
  durationToPx,
  type EventGroup,
  offsetToPx,
  usesCarousel,
} from "@/components/day-detail/dayLayout";
import { EventCard } from "@/components/day-detail/EventCard";
import { EventCarousel } from "@/components/day-detail/EventCarousel";
import { TimelineGrid } from "@/components/day-detail/TimelineGrid";

type DayTimelineProps = {
  groups: EventGroup[];
  startHour: number;
  endHour: number;
  colorFor: (materia: string) => string;
};

export function DayTimeline({
  groups,
  startHour,
  endHour,
  colorFor,
}: DayTimelineProps) {
  const origin = startHour * 60;

  return (
    <TimelineGrid startHour={startHour} endHour={endHour}>
      {groups.map((group) =>
        usesCarousel(group) ? (
          <div
            key={`group-${group.start}-${group.end}`}
            className="absolute left-0 w-full"
            style={{
              top: offsetToPx(group.start, origin),
              height: durationToPx(group.start, group.end),
            }}
          >
            <EventCarousel group={group} colorFor={colorFor} />
          </div>
        ) : (
          group.events.map((event) => {
            const width = 100 / event.columns;
            return (
              <EventCard
                key={`${event.materia}-${event.time}`}
                event={event}
                color={colorFor(event.materia)}
                style={{
                  top: offsetToPx(event.startMin, origin),
                  height: durationToPx(event.startMin, event.endMin),
                  left: `${event.column * width}%`,
                  width: `${width}%`,
                }}
              />
            );
          })
        ),
      )}
    </TimelineGrid>
  );
}

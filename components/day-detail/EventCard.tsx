import { Clock, MapPin, User, Video } from "lucide-react";
import type { CSSProperties } from "react";
import {
  durationToPx,
  type PositionedEvent,
} from "@/components/day-detail/dayLayout";
import { OverlapChip } from "@/components/day-detail/OverlapChip";

const PROFESSOR_MIN_HEIGHT = 96;

type EventCardProps = {
  event: PositionedEvent;
  color: string;
  style: CSSProperties;
};

export function EventCard({ event, color, style }: EventCardProps) {
  const height = durationToPx(event.startMin, event.endMin);
  const times = event.time.split(" - ").join(" – ");

  return (
    <div className="absolute p-1" style={style}>
      <div className="flex h-full w-full items-stretch gap-3 overflow-hidden rounded-md bg-card p-3 elevation-1">
        <div
          className="w-1 shrink-0 self-stretch rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span>{times}</span>
          </div>
          <h4 className="line-clamp-2 text-sm font-semibold leading-tight">
            {event.materia}
          </h4>
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1.5">
              {event.isVideo ? (
                <Video className="size-3.5 shrink-0 text-blue-500" />
              ) : (
                <MapPin className="size-3.5 shrink-0" />
              )}
              <span className="leading-tight">{event.aula}</span>
            </span>
            {event.docente && height >= PROFESSOR_MIN_HEIGHT && (
              <span className="flex min-w-0 items-center gap-1.5">
                <User className="size-3.5 shrink-0" />
                <span className="leading-tight">{event.docente}</span>
              </span>
            )}
            {event.overlapping && <OverlapChip />}
          </div>
        </div>
      </div>
    </div>
  );
}

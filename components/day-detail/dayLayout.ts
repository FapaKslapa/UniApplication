import type { ParsedEvent } from "@/lib/orario-utils";

export const HALF_HOUR_HEIGHT = 44;
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;
const MAX_COLUMNS_BEFORE_CAROUSEL = 2;

type TimedEvent = ParsedEvent & { startMin: number; endMin: number };

export type PositionedEvent = TimedEvent & {
  column: number;
  columns: number;
  overlapping: boolean;
};

export type EventGroup = {
  events: PositionedEvent[];
  start: number;
  end: number;
  columns: number;
};

export type DayLayout = {
  groups: EventGroup[];
  untimed: ParsedEvent[];
  startHour: number;
  endHour: number;
};

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isCancelled(time: string): boolean {
  return time.toUpperCase().includes("ANNULLATO");
}

function toTimedEvent(event: ParsedEvent): TimedEvent {
  const [start, end] = event.time.split(" - ");
  return { ...event, startMin: toMinutes(start), endMin: toMinutes(end) };
}

function byStartThenLongest(a: TimedEvent, b: TimedEvent): number {
  return (
    a.startMin - b.startMin || b.endMin - b.startMin - (a.endMin - a.startMin)
  );
}

function clusterOverlaps(sorted: TimedEvent[]): TimedEvent[][] {
  const clusters: { events: TimedEvent[]; end: number }[] = [];
  for (const event of sorted) {
    const last = clusters.at(-1);
    if (last && event.startMin < last.end) {
      last.events.push(event);
      last.end = Math.max(last.end, event.endMin);
    } else {
      clusters.push({ events: [event], end: event.endMin });
    }
  }
  return clusters.map((cluster) => cluster.events);
}

function assignColumns(cluster: TimedEvent[]): EventGroup {
  const columnEnds: number[] = [];
  const placed = cluster.map((event) => {
    const free = columnEnds.findIndex((end) => event.startMin >= end);
    const column = free === -1 ? columnEnds.length : free;
    columnEnds[column] = event.endMin;
    return { event, column };
  });

  const columns = columnEnds.length;
  const events = placed.map(({ event, column }) => ({
    ...event,
    column,
    columns,
    overlapping: cluster.some(
      (other) =>
        other !== event &&
        event.startMin < other.endMin &&
        event.endMin > other.startMin,
    ),
  }));

  return {
    events,
    start: Math.min(...events.map((event) => event.startMin)),
    end: Math.max(...events.map((event) => event.endMin)),
    columns,
  };
}

export function layoutDayEvents(events: ParsedEvent[]): DayLayout {
  const visible = events.filter((event) => !isCancelled(event.time));
  const groups = clusterOverlaps(
    visible
      .filter((event) => event.time.includes(" - "))
      .map(toTimedEvent)
      .sort(byStartThenLongest),
  ).map(assignColumns);

  const untimed = visible.filter((event) => !event.time.includes(" - "));

  const startHour =
    groups.length > 0
      ? Math.min(...groups.map((group) => Math.floor(group.start / 60)))
      : DEFAULT_START_HOUR;
  const endHour =
    groups.length > 0
      ? Math.max(...groups.map((group) => Math.ceil(group.end / 60)))
      : DEFAULT_END_HOUR;

  return { groups, untimed, startHour, endHour };
}

export function usesCarousel(group: EventGroup): boolean {
  return group.columns > MAX_COLUMNS_BEFORE_CAROUSEL;
}

export function offsetToPx(minutes: number, originMinutes: number): number {
  return ((minutes - originMinutes) / 30) * HALF_HOUR_HEIGHT;
}

export function durationToPx(startMin: number, endMin: number): number {
  return ((endMin - startMin) / 30) * HALF_HOUR_HEIGHT;
}

import type { TimetableChange } from "@/components/home/types";

export type HistoryEntry = {
  linkId: string;
  updatedAt: number;
  changes: TimetableChange[];
};

export type HistoryGroup = {
  key: string;
  label: string;
  entries: HistoryEntry[];
};

function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayLabel(timestamp: number, now: number): string {
  const key = dayKey(timestamp);
  if (key === dayKey(now)) return "Oggi";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === dayKey(yesterday.getTime())) return "Ieri";
  const label = new Date(timestamp).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return label.charAt(0).toUpperCase() + label.slice(1).replace(/\./g, "");
}

export function groupHistoryByDay(
  entries: HistoryEntry[],
  now: number = Date.now(),
): HistoryGroup[] {
  const groups = new Map<string, HistoryGroup>();
  for (const entry of [...entries].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const key = dayKey(entry.updatedAt);
    const group = groups.get(key) ?? {
      key,
      label: dayLabel(entry.updatedAt, now),
      entries: [],
    };
    group.entries.push(entry);
    groups.set(key, group);
  }
  return [...groups.values()];
}

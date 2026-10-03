const SEEN_KEY = "seen_timetable_changes";
const LAST_SEEN_KEY = "last_seen_timetable_update";

type SeenMap = Record<string, number>;

function readSeen(): SeenMap {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as SeenMap) : {};
  } catch {
    return {};
  }
}

function writeSeen(seen: SeenMap) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    return;
  }
}

function readGlobalSeen(): number {
  const value = Number.parseInt(localStorage.getItem(LAST_SEEN_KEY) ?? "0", 10);
  return Number.isFinite(value) ? value : 0;
}

export function markChangesViewed() {
  localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
}

export function baselineCourses(linkIds: string[]) {
  const seen = readSeen();
  let dirty = false;
  for (const id of linkIds) {
    if (seen[id] === undefined) {
      seen[id] = Date.now();
      dirty = true;
    }
  }
  if (dirty) writeSeen(seen);
}

type CourseChanges<T> = { linkId: string; updatedAt: number; changes: T[] };

export function collectUnseenChanges<T>(entries: CourseChanges<T>[]): T[] {
  const seen = readSeen();
  const globalSeen = readGlobalSeen();
  const fresh: T[] = [];
  for (const entry of entries) {
    const threshold = Math.max(seen[entry.linkId] ?? Date.now(), globalSeen);
    if (entry.updatedAt <= threshold) continue;
    fresh.push(...entry.changes);
    seen[entry.linkId] = entry.updatedAt;
  }
  writeSeen(seen);
  return fresh;
}

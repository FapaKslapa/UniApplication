const MS_PER_DAY = 86_400_000;

export function weekOffsetForDate(isoDate: string): number {
  const target = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / MS_PER_DAY,
  );
  return Math.floor(diffDays / 7) * 7;
}

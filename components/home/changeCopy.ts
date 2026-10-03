import type { TimetableChange } from "@/components/home/types";

export function getChangeHeadline(change: TimetableChange): string {
  if (change.type === "CANCELED") return "Lezione annullata";
  if (change.type === "ADDED") return "Nuova lezione";
  const hasTime = !!change.diffs?.time;
  const hasLocation = !!change.diffs?.location;
  if (hasTime && hasLocation) return "Orario e aula cambiati";
  if (hasTime) return "Orario spostato";
  if (hasLocation) return "Aula cambiata";
  if (change.diffs?.professor) return "Docente cambiato";
  return "Lezione modificata";
}

export function formatChangeDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

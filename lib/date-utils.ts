import { DateTime } from "luxon";

// Funzione per ottenere la data/ora attuale nel fuso orario italiano
export function getCurrentItalianDateTime() {
  return DateTime.now().setZone("Europe/Rome");
}

// Funzione per formattare una data nel formato desiderato
export function formatDate(date: DateTime, format: string = "yyyy-MM-dd") {
  return date.toFormat(format);
}

// Funzione per aggiungere giorni a una data
export function addDays(date: DateTime, days: number) {
  return date.plus({ days });
}

// Funzione per ottenere il giorno della settimana (0-6, lunedì-domenica)
export function getDayOfWeek(date: DateTime) {
  // Luxon usa 1-7 (lunedì-domenica), convertito in 0-6
  return date.weekday === 7 ? 6 : date.weekday - 1;
}

// Funzione per convertire minuti dall'inizio del giorno in un oggetto DateTime
export function minutesToTime(minutes: number, baseDate?: DateTime) {
  const base = baseDate || getCurrentItalianDateTime().startOf("day");
  return base.plus({ minutes });
}

// Funzione per convertire un orario "HH:MM" in minuti dall'inizio del giorno
export function timeToMinutes(timeString: string): number | null {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  return hours * 60 + minutes;
}

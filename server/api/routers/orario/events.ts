import { DateTime } from "luxon";
import { type CinecaEvent, fetchCinecaEvents } from "@/lib/cineca";
import {
  addDays,
  getCurrentItalianDateTime,
  getDayOfWeek,
} from "@/lib/date-utils";
import { toTitleCase } from "@/lib/utils";

export type LocationFilter = "Varese" | "Como" | "Tutte";

export type OrarioData = Array<{
  day: number;
  events: Array<{
    time: string;
    title: string;
    location: string;
    professor: string;
    isVideo?: boolean;
  }>;
}>;

export const fetchRawEvents = async (
  dayOffset = 0,
  linkId: string,
): Promise<CinecaEvent[]> => {
  if (!linkId) return [];

  const currentDate = getCurrentItalianDateTime();
  const targetDate = addDays(currentDate, dayOffset);
  const dayOfWeek = getDayOfWeek(targetDate);
  const startRange = targetDate.minus({ days: dayOfWeek }).startOf("day");
  const endRange = startRange.plus({ days: 6 }).endOf("day");

  return fetchCinecaEvents(linkId, startRange, endRange);
};

export const subjectTitle = (event: CinecaEvent) => {
  const rawTitle = event.nome || "Lezione";
  const aulaMatch = rawTitle.match(/^(.+?)Aula/);
  return toTitleCase(aulaMatch ? aulaMatch[1].trim() : rawTitle);
};

export const professorName = (event: CinecaEvent) =>
  event.docenti?.[0]
    ? toTitleCase(`${event.docenti[0].cognome} ${event.docenti[0].nome}`)
    : "N/A";

export const mapEvent = (
  event: CinecaEvent,
  locationFilter: LocationFilter,
  professorFilter?: string,
) => {
  const date = DateTime.fromISO(event.dataInizio).setZone("Europe/Rome");
  const title = subjectTitle(event);
  const professor = professorName(event);

  if (
    professorFilter &&
    professor.toLowerCase() !== professorFilter.toLowerCase()
  )
    return null;

  const hasComoRooms = (event.aule || []).some(
    (a) =>
      (a.edificio?.comune || "").toUpperCase().includes("COMO") ||
      a.descrizione.toUpperCase().includes("COMO"),
  );

  const isVideoConference =
    ["VIDEOCONFERENZA", "TEAMS", "VIDEOCHIAMATA"].some((term) =>
      title.toUpperCase().includes(term),
    ) ||
    hasComoRooms ||
    (event.aule || []).some((a) =>
      ["VIDEOCONFERENZA", "TEAMS"].some((term) =>
        a.descrizione.toUpperCase().includes(term),
      ),
    );

  let matchesLocation = locationFilter === "Tutte" || isVideoConference;

  const filteredAule = (event.aule || []).filter((aula) => {
    if (locationFilter === "Tutte") return true;
    const name = aula.descrizione.toUpperCase();
    const city = (aula.edificio?.comune || "Unknown").toUpperCase();

    if (locationFilter === "Varese") {
      return city.includes("VARESE") || name.includes("VARESE");
    }
    if (locationFilter === "Como") {
      return city.includes("COMO") || name.includes("COMO");
    }
    return true;
  });

  if (locationFilter !== "Tutte" && !matchesLocation) {
    matchesLocation = filteredAule.length > 0;
  }

  if (!matchesLocation) return null;

  const location =
    filteredAule
      .map(
        (aula) => `${aula.descrizione} (${aula.edificio?.comune || "Unknown"})`,
      )
      .join(" | ") || (isVideoConference ? "Videoconferenza Online" : "N/A");

  const start = date.toFormat("HH:mm");
  const end = DateTime.fromISO(event.dataFine)
    .setZone("Europe/Rome")
    .toFormat("HH:mm");

  return {
    date: date.toISODate(),
    day: getDayOfWeek(date),
    time: `${start} - ${end}`,
    title,
    location,
    professor,
    isVideo: isVideoConference,
  };
};

export const processEvents = (
  events: CinecaEvent[],
  locationFilter: LocationFilter,
  professorFilter?: string,
): OrarioData => {
  const result: OrarioData = Array.from({ length: 7 }, (_, d) => ({
    day: d,
    events: [],
  }));

  const processed = events
    .map((event) => mapEvent(event, locationFilter, professorFilter))
    .filter((e): e is NonNullable<typeof e> => e !== null);

  for (const event of processed) {
    if (event.day >= 0 && event.day <= 6) {
      const isDuplicate = result[event.day].events.some(
        (existing) =>
          existing.title === event.title &&
          existing.time === event.time &&
          existing.location === event.location,
      );

      if (!isDuplicate) {
        result[event.day].events.push({
          time: event.time,
          title: event.title,
          location: event.location,
          professor: event.professor,
          isVideo: event.isVideo,
        });
      }
    }
  }

  return result.map((day) => ({
    ...day,
    events: day.events.sort((a, b) => a.time.localeCompare(b.time)),
  }));
};

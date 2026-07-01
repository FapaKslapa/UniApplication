import type { DateTime } from "luxon";

export interface ParsedEvent {
  time: string;
  materia: string;
  aula: string;
  docente: string;
  tipo: string;
  fullDate?: string;
  isVideo?: boolean;
}

export interface DaySchedule {
  day: number;
  dayOfMonth?: number;
  events: ParsedEvent[];
  date?: DateTime;
  materiaColorMap?: Record<string, string>;
}

const giorni = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

export function getDayName(dayIndex: number): string {
  return giorni[dayIndex] || `Giorno ${dayIndex}`;
}

export function parseEventTitle(title: string): {
  materia: string;
  aula: string;
  docente: string;
  tipo: string;
} {
  const aulaMatch = title.match(/^(.+?)Aula/);
  const materia = aulaMatch ? aulaMatch[1].trim() : title;
  const aulaFullMatch = title.match(/Aula\s+(.+?)(?=\s+[A-Z]\.\s+[A-Z]+)/);
  const aula = aulaFullMatch ? `Aula ${aulaFullMatch[1].trim()}` : "";
  const docenteMatch = title.match(
    /\s([A-Z]\.\s+[A-Z][A-Z\s]+?)(?=Orario|Lezione|Laboratorio|SEDI|$)/,
  );
  let docente = docenteMatch ? docenteMatch[1].trim() : "";

  if (docente?.endsWith("L")) {
    docente = docente.slice(0, -1).trim();
  }

  const tipo = title.includes("Laboratorio") ? "Laboratorio" : "Lezione";

  return { materia, aula, docente, tipo };
}

export function extractCalendarId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const paramId = urlObj.searchParams.get("linkCalendarioId");
    if (paramId) return paramId;

    const pathMatch = url.match(/linkCalendarioId=([a-f0-9]{24})/i);
    if (pathMatch) return pathMatch[1];

    return null;
  } catch {
    const directIdMatch = url.match(/\b([a-f0-9]{24})\b/i);
    if (directIdMatch) return directIdMatch[1];

    return null;
  }
}

export function parseOrarioData(
  rawData: {
    day: number;
    events: {
      time: string;
      title: string;
      location?: string;
      professor?: string;
      isVideo?: boolean;
    }[];
  }[],
): DaySchedule[] {
  return rawData.map((day) => ({
    day: day.day,
    events: day.events.map((event) => {
      if (event.location !== undefined || event.professor !== undefined) {
        return {
          time: event.time,
          materia: event.title,
          aula: event.location || "",
          docente: event.professor || "",
          tipo: event.title.includes("Laboratorio") ? "Laboratorio" : "Lezione",
          isVideo: event.isVideo,
        };
      }

      const parsed = parseEventTitle(event.title);
      return {
        time: event.time,
        ...parsed,
      };
    }),
  }));
}

const COLOR_PALETTE = [
  "#FF2B2B",
  "#4A90FF",
  "#F5E642",
  "#00C4A0",
  "#FF7A00",
  "#A259FF",
  "#00D4FF",
  "#4570EA",
  "#F59E0B",
  "#06B6D4",
  "#EC4899",
  "#10B981",
  "#F97316",
  "#8B5CF6",
  "#14B8A6",
  "#6366F1",
];

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
}

export function getMateriaColorMap(materie: string[]): Record<string, string> {
  const uniqueMaterie = Array.from(
    new Set(
      materie.map((m) =>
        m
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase()
          .trim(),
      ),
    ),
  ).sort();

  const colorMap: Record<string, string> = {};
  uniqueMaterie.forEach((mat, idx) => {
    colorMap[mat] =
      idx < COLOR_PALETTE.length ? COLOR_PALETTE[idx] : stringToColor(mat);
  });
  return colorMap;
}

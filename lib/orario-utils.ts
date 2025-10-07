export interface ParsedEvent {
  time: string;
  materia: string;
  aula: string;
  docente: string;
  tipo: string;
}

export interface DaySchedule {
  day: number;
  events: ParsedEvent[];
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

  const aulaFullMatch = title.match(/Aula\s+(.+?)\s+([A-Z]\.\s*[A-Z]+)/);
  const aula = aulaFullMatch ? `Aula ${aulaFullMatch[1].trim()}` : "";

  let docente = aulaFullMatch ? aulaFullMatch[2].trim() : "";

  // Rimuovi eventuali "L" finali aggiunte erroneamente
  if (docente?.endsWith("L")) {
    docente = docente.slice(0, -1);
  }

  const tipo = title.includes("Laboratorio") ? "Laboratorio" : "Lezione";

  return { materia, aula, docente, tipo };
}

export function parseOrarioData(
  rawData: { day: number; events: { time: string; title: string }[] }[],
): DaySchedule[] {
  return rawData.map((day) => ({
    day: day.day,
    events: day.events.map((event) => {
      const parsed = parseEventTitle(event.title);
      return {
        time: event.time,
        ...parsed,
      };
    }),
  }));
}

const COLOR_PALETTE = [
  "#00D4FF", // azzurro
  "#FF3366", // rosa
  "#00FF88", // verde
  "#FFAA00", // arancione
  "#A259FF", // viola
  "#FF6F00", // arancio scuro
  "#FFB300", // giallo
  "#009688", // teal
  "#C51162", // magenta
  "#1976D2", // blu
  "#43A047", // verde scuro
  "#F44336", // rosso
  "#8D6E63", // marrone
  "#607D8B", // grigio blu
];

export function getMateriaColorMap(materie: string[]): Record<string, string> {
  const uniqueMaterie = Array.from(
    new Set(
      materie.map((m) =>
        m
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase(),
      ),
    ),
  );
  const colorMap: Record<string, string> = {};
  uniqueMaterie.forEach((mat, idx) => {
    colorMap[mat] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
  });
  return colorMap;
}

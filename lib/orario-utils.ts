// Utilities per parsare e formattare i dati dell'orario

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

const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export function getDayName(dayIndex: number): string {
  return giorni[dayIndex] || `Giorno ${dayIndex}`;
}

export function parseEventTitle(title: string): { materia: string; aula: string; docente: string; tipo: string } {
  // Formato esempio: "BASI DI DATIAula 2 SEP (Pad. Seppilli) E. FERRARIOrario provvisorioLezioneSEDI\VarINFO"

  // Estrai la materia (tutto prima di "Aula")
  const aulaMatch = title.match(/^(.+?)Aula/);
  const materia = aulaMatch ? aulaMatch[1].trim() : title;

  // Estrai l'aula (da "Aula" fino al primo nome in maiuscolo con punto)
  const aulaFullMatch = title.match(/Aula\s+(.+?)\s+([A-Z]\.\s*[A-Z]+)/);
  const aula = aulaFullMatch ? `Aula ${aulaFullMatch[1].trim()}` : '';

  // Estrai il docente
  const docente = aulaFullMatch ? aulaFullMatch[2].trim() : '';

  // Estrai il tipo (Lezione o Laboratorio)
  const tipo = title.includes('Laboratorio') ? 'Laboratorio' : 'Lezione';

  return { materia, aula, docente, tipo };
}

export function parseOrarioData(rawData: { day: number; events: { time: string; title: string }[] }[]): DaySchedule[] {
  return rawData.map(day => ({
    day: day.day,
    events: day.events.map(event => {
      const parsed = parseEventTitle(event.title);
      return {
        time: event.time,
        ...parsed
      };
    })
  }));
}

// Colori Nothing OS per le materie - LED-like accent colors
export function getMateriaColor(materia: string): string {
  const colors: Record<string, string> = {
    'BASI DI DATI': '#00D4FF',
    'PROBABILITA E STATISTICA PER L\'INFORMATICA': '#FF3366',
    'SISTEMI OPERATIVI': '#00FF88',
    'PROGETTAZIONE DEL SOFTWARE': '#FFAA00',
  };

  // Normalizza il nome della materia rimuovendo accenti per il matching
  const normalizedMateria = materia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  return colors[normalizedMateria] || colors[materia] || '#666666';
}

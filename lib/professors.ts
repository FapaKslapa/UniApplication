import { getVisibleCourses } from "@/lib/courses";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import { toTitleCase } from "@/lib/utils";

export const PROFESSORS_CACHE_URL = "https://orario-cache.internal/professors";

const CINECA_URL =
  "https://unins.prod.up.cineca.it/api/Impegni/getImpegniCalendarioPubblico";

type CinecaDocente = { cognome: string; nome: string };
type CinecaEvent = { docenti?: CinecaDocente[] };

async function fetchDocenti(
  linkId: string,
  startRange: string,
  endRange: string,
): Promise<string[]> {
  try {
    const response = await fetch(CINECA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mostraImpegniAnnullati: true,
        mostraIndisponibilitaTotali: false,
        linkCalendarioId: linkId,
        clienteId: "59f05192a635f443422fe8fd",
        pianificazioneTemplate: false,
        dataInizio: startRange,
        dataFine: endRange,
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const text = (await response.text()).trim();
    if (!text) return [];
    const data: unknown = JSON.parse(text);
    const events: CinecaEvent[] = Array.isArray(data)
      ? (data as CinecaEvent[])
      : ((data as { impegni?: CinecaEvent[] } | null)?.impegni ?? []);
    return events.flatMap((e) =>
      (e.docenti || []).map((d) => toTitleCase(`${d.cognome} ${d.nome}`)),
    );
  } catch (error) {
    console.error(`Failed to fetch professors for ${linkId}:`, error);
    return [];
  }
}

export async function computeAllProfessors(
  windowDays: number,
): Promise<string[]> {
  const visibleCourses = await getVisibleCourses();
  const ids = visibleCourses.map((c) => c.linkId);
  if (ids.length === 0) return [];

  const startRange = getCurrentItalianDateTime().startOf("day");
  const endRange = startRange.plus({ days: windowDays }).endOf("day");
  const start = startRange.toISO() ?? "";
  const end = endRange.toISO() ?? "";

  const lists = await Promise.all(
    ids.map((id) => fetchDocenti(id, start, end)),
  );
  const combined = new Set(lists.flat());

  return Array.from(combined)
    .filter((p) => p !== "N/A" && p.trim() !== "")
    .sort();
}

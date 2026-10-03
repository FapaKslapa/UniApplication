import type { DateTime } from "luxon";

export interface CinecaEvent {
  nome?: string;
  dataInizio: string;
  dataFine: string;
  aule?: Array<{
    descrizione: string;
    edificio?: {
      comune: string;
    };
  }>;
  docenti?: Array<{
    cognome: string;
    nome: string;
  }>;
  corsi?: Array<{
    descrizione: string;
  }>;
  id?: string;
  eventoId?: string;
  stato?: string;
  tipoEvento?: { descrizione?: string };
  tipoAttivita?: { descrizione?: string };
}

const parseCinecaEvents = async (
  response: Response,
): Promise<CinecaEvent[]> => {
  const text = (await response.text()).trim();
  if (!text) return [];
  try {
    const data: unknown = JSON.parse(text);
    if (Array.isArray(data)) return data as CinecaEvent[];
    const impegni = (data as { impegni?: CinecaEvent[] } | null)?.impegni;
    return Array.isArray(impegni) ? impegni : [];
  } catch {
    return [];
  }
};

const CINECA_URL =
  "https://unins.prod.up.cineca.it/api/Impegni/getImpegniCalendarioPubblico";
const CINECA_CACHE_TTL_SECONDS = 15 * 60;

export const fetchCinecaEvents = async (
  linkId: string,
  startRange: DateTime,
  endRange: DateTime,
): Promise<CinecaEvent[]> => {
  if (!linkId) return [];

  const workerCaches =
    typeof caches !== "undefined"
      ? (caches as unknown as { default: Cache })
      : undefined;
  const cache = workerCaches?.default;
  const cacheKey = cache
    ? new Request(
        `https://cineca-cache.internal/${linkId}?start=${encodeURIComponent(startRange.toISO() ?? "")}&end=${encodeURIComponent(endRange.toISO() ?? "")}`,
      )
    : undefined;

  if (cache && cacheKey) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      try {
        return (await cached.json()) as CinecaEvent[];
      } catch {}
    }
  }

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
        dataInizio: startRange.toISO(),
        dataFine: endRange.toISO(),
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const events = await parseCinecaEvents(response);

    if (cache && cacheKey) {
      await cache.put(
        cacheKey,
        new Response(JSON.stringify(events), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `max-age=${CINECA_CACHE_TTL_SECONDS}`,
          },
        }),
      );
    }

    return events;
  } catch (error) {
    console.error(`Failed to fetch Cineca events for ${linkId}:`, error);
    return [];
  }
};

export type Venue = {
  label: string;
  query: string;
  exact: boolean;
};

type Rule = { test: RegExp; venue: Venue };

const VARESE_RULES: Rule[] = [
  {
    test: /\b(TM|P\.?\s?M\.?)\b/i,
    venue: {
      label: "Padiglione Morselli · Via O. Rossi 9",
      query: "Padiglione Morselli, Via Rossi 9, 21100 Varese",
      exact: true,
    },
  },
  {
    test: /\bMTG\b/i,
    venue: {
      label: "Monte Generoso · Via Monte Generoso 71",
      query: "Università dell'Insubria, Via Monte Generoso 71, 21100 Varese",
      exact: true,
    },
  },
  {
    test: /\bSEP\b/i,
    venue: {
      label: "Aule Seppilli · Via O. Rossi 9",
      query: "Aule Seppilli, Via Rossi 9, 21100 Varese",
      exact: true,
    },
  },
  {
    test: /\bP\.?A\.?\b/i,
    venue: {
      label: "Padiglione Antonini · Via O. Rossi 9",
      query: "Padiglione Antonini, Via Rossi 9, 21100 Varese",
      exact: true,
    },
  },
];

const CITY_FALLBACK: Record<string, Venue> = {
  varese: {
    label: "Campus Bizzozero, Varese",
    query: "Università dell'Insubria, Via J.H. Dunant 3, 21100 Varese",
    exact: false,
  },
  como: {
    label: "Università dell'Insubria, Como",
    query: "Università dell'Insubria, Como",
    exact: false,
  },
  busto: {
    label: "Molini Marzoli, Busto Arsizio",
    query:
      "Università dell'Insubria, Via A. da Giussano 12, 21052 Busto Arsizio",
    exact: false,
  },
};

function cityOf(aula: string): keyof typeof CITY_FALLBACK | null {
  const text = aula.toLowerCase();
  if (text.includes("(varese)")) return "varese";
  if (text.includes("(como)")) return "como";
  if (text.includes("busto")) return "busto";
  return null;
}

export function venueFor(aula: string | undefined | null): Venue | null {
  if (!aula) return null;
  const first = aula.split("|")[0]?.trim() ?? "";
  if (!first || first.toUpperCase() === "N/A") return null;
  const city = cityOf(first);
  if (!city) return null;
  if (city === "varese") {
    const rule = VARESE_RULES.find((entry) => entry.test.test(first));
    if (rule) return rule.venue;
  }
  return CITY_FALLBACK[city];
}

export function mapsUrl(venue: Venue): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.query)}`;
}

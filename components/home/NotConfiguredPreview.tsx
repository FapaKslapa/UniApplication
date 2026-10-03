import { Clock, MapPin } from "lucide-react";

const SAMPLE_ROWS = [
  { time: "09:00", subject: "Analisi matematica", place: "Aula 4" },
  { time: "11:00", subject: "Programmazione", place: "Aula 12" },
  { time: "14:30", subject: "Fisica", place: "Aula 2" },
];

export function NotConfiguredPreview() {
  return (
    <figure className="w-full max-w-xs">
      <div
        aria-hidden
        className="space-y-1 rounded-xl bg-card p-2 text-left elevation-2"
      >
        {SAMPLE_ROWS.map((row, index) => (
          <div
            key={row.time}
            className={
              index === 0
                ? "flex items-center gap-3 rounded-lg bg-brand p-3 text-brand-foreground"
                : "flex items-center gap-3 rounded-lg p-3"
            }
          >
            <span className="num-display w-12 shrink-0 text-lg font-bold">
              {row.time}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {row.subject}
              </span>
              <span
                className={
                  index === 0
                    ? "flex items-center gap-1 text-xs"
                    : "flex items-center gap-1 text-xs text-muted-foreground"
                }
              >
                <MapPin className="size-3" />
                {row.place}
              </span>
            </span>
            {index === 0 && <Clock className="size-4 shrink-0" />}
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Esempio: così vedrai le tue lezioni, con aula e orario.
      </figcaption>
    </figure>
  );
}

import { Layers, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ParsedEvent } from "@/lib/orario-utils";

type OtherActivitiesProps = {
  events: ParsedEvent[];
};

export function OtherActivities({ events }: OtherActivitiesProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Layers className="size-4" />
        <h3 className="text-sm font-semibold">Altre attività</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {events.map((event) => (
          <div
            key={`${event.materia}-${event.time}`}
            className="rounded-md bg-card p-4 elevation-1"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold leading-tight">
                {event.materia}
              </span>
              <Badge variant="secondary">{event.time}</Badge>
            </div>
            {event.aula && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                <span>{event.aula}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

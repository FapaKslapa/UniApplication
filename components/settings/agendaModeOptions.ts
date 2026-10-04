import type { SegmentedOption } from "@/components/settings/SegmentedControl";
import type { AgendaMode } from "@/lib/agenda/types";

export const AGENDA_MODE_OPTIONS: readonly SegmentedOption<AgendaMode>[] = [
  { value: "day", label: "Giorno" },
  { value: "week", label: "Settimana" },
  { value: "month", label: "Mese" },
];

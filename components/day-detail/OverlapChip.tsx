import { AlertTriangle } from "lucide-react";

export function OverlapChip() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
      <AlertTriangle className="size-3" strokeWidth={2.5} />
      Sovrapposizione
    </span>
  );
}

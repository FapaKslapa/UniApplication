import { ArrowRight } from "lucide-react";

interface DiffValueProps {
  previous: string;
  current: string;
}

export function DiffValue({ previous, current }: DiffValueProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2">
      <span className="sr-only">Prima:</span>
      <del className="text-muted-foreground">{previous}</del>
      <ArrowRight className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only">Ora:</span>
      <ins className="text-sm font-bold no-underline">{current}</ins>
    </div>
  );
}

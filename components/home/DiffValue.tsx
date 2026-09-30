import { ArrowRight } from "lucide-react";

interface DiffValueProps {
  previous: string;
  current: string;
}

export function DiffValue({ previous, current }: DiffValueProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2">
      <span className="text-muted-foreground line-through">{previous}</span>
      <ArrowRight className="size-3 shrink-0" />
      <span className="font-bold">{current}</span>
    </div>
  );
}

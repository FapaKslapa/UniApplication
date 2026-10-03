import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function OverlapMark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Sovrapposizione oraria"
      className={cn(
        "relative inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-warning text-warning-foreground before:absolute before:-inset-2.5 before:content-['']",
        className,
      )}
    >
      <AlertTriangle className="size-3.5" strokeWidth={2.5} />
    </span>
  );
}

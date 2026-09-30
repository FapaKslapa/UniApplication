import { ArrowLeftToLine, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MonthNavProps = {
  isCurrentMonth: boolean;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function MonthNav({
  isCurrentMonth,
  onToday,
  onPrev,
  onNext,
}: MonthNavProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Vai a oggi"
        onClick={onToday}
        className={cn(
          "text-muted-foreground",
          isCurrentMonth && "pointer-events-none opacity-0",
        )}
      >
        <ArrowLeftToLine className="size-4" />
      </Button>
      <div className="flex items-center gap-1 rounded-full bg-card p-1 elevation-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mese precedente"
          onClick={onPrev}
          className="rounded-full"
        >
          <ChevronLeft className="size-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mese successivo"
          onClick={onNext}
          className="rounded-full"
        >
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

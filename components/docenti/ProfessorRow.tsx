import { Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfessorRowProps = {
  name: string;
  status?: string;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

export function ProfessorRow({
  name,
  status,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: ProfessorRowProps) {
  return (
    <div className="flex items-center gap-1 rounded-md bg-card elevation-1">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-md py-2 pl-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="size-4 text-muted-foreground" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{name}</span>
          {status && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {status}
            </span>
          )}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={
          isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
        }
        onClick={onToggleFavorite}
        className="mr-1 shrink-0 rounded-full"
      >
        <Star
          className={cn(
            "size-4",
            isFavorite ? "fill-warning text-warning" : "text-muted-foreground",
          )}
        />
      </Button>
    </div>
  );
}

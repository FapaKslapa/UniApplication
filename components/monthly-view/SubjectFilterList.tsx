import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubjectFilterListProps = {
  materie: string[];
  hiddenSubjects: string[];
  colorFor: (materia: string) => string;
  onToggle: (materia: string) => void;
};

export function SubjectFilterList({
  materie,
  hiddenSubjects,
  colorFor,
  onToggle,
}: SubjectFilterListProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col pt-2">
      <div className="flex shrink-0 items-center gap-2 px-2 pb-2">
        <Filter className="size-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-muted-foreground">
          Filtra materie
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-1 pb-4 custom-scrollbar">
        <div className="grid grid-cols-1 gap-1.5">
          {materie.map((materia) => {
            const isHidden = hiddenSubjects.includes(materia);
            return (
              <Button
                key={materia}
                variant="outline"
                onClick={() => onToggle(materia)}
                className={cn(
                  "h-auto justify-start gap-3 rounded-md px-4 py-3 text-left",
                  isHidden && "opacity-40",
                )}
              >
                <div
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorFor(materia) }}
                />
                <span className="flex-1 truncate text-xs font-semibold capitalize">
                  {materia.toLowerCase()}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Search as SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ExamSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ExamSearchInput({ value, onChange }: ExamSearchInputProps) {
  return (
    <div className="relative shrink-0">
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cerca materia o corso"
        aria-label="Cerca materia o corso"
        className="h-11 rounded-full pr-11 pl-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cancella ricerca"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-0.5 size-10 -translate-y-1/2 rounded-full text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

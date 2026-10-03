import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export function SearchInput({
  value,
  placeholder,
  onChange,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder.replace(/[….]+$/, "")}
        className="h-11 rounded-full border-0 bg-muted pr-11 pl-10 shadow-none dark:bg-muted"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancella ricerca"
          onClick={() => onChange("")}
          className="absolute top-0 right-0 rounded-full text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

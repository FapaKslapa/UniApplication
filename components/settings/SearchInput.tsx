import { Search } from "lucide-react";
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
      <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-full border-0 bg-muted pr-4 pl-10 shadow-none dark:bg-muted"
      />
    </div>
  );
}

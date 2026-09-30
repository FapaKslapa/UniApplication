import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectIndicatorProps = {
  selected: boolean;
  shape: "checkbox" | "radio";
  inverted?: boolean;
};

export function SelectIndicator({
  selected,
  shape,
  inverted = false,
}: SelectIndicatorProps) {
  return (
    <div
      className={cn(
        "flex size-5 shrink-0 items-center justify-center border-2 transition-colors",
        shape === "checkbox" ? "rounded-sm" : "rounded-full",
        !selected && "border-border",
        selected &&
          !inverted &&
          "border-primary bg-primary text-primary-foreground",
        selected &&
          inverted &&
          "border-primary-foreground bg-primary-foreground text-primary",
      )}
    >
      {selected &&
        (shape === "checkbox" ? (
          <Check className="size-3 stroke-[3]" />
        ) : (
          <div className="size-2 rounded-full bg-current" />
        ))}
    </div>
  );
}

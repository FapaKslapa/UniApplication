import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  compact = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("flex gap-1 rounded-full bg-muted p-1", className)}>
      {options.map(({ value: optionValue, label, icon: Icon }) => (
        <Button
          key={optionValue}
          variant="ghost"
          size={compact ? "sm" : "default"}
          onClick={() => onChange(optionValue)}
          className={cn(
            "rounded-full text-xs font-semibold text-muted-foreground",
            !compact && "flex-1",
            value === optionValue && "bg-card text-foreground elevation-1",
          )}
        >
          {Icon && <Icon className="size-3.5" />}
          {label}
        </Button>
      ))}
    </div>
  );
}

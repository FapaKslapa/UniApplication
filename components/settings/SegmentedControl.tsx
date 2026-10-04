import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  ariaLabel?: string;
  icon?: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  compact?: boolean;
  className?: string;
};

const STEP_BY_KEY: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  compact = false,
  className,
}: SegmentedControlProps<T>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = STEP_BY_KEY[event.key];
    if (!step) return;
    event.preventDefault();
    const current = options.findIndex((option) => option.value === value);
    const next = (current + step + options.length) % options.length;
    onChange(options[next].value);
    const buttons =
      event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    buttons[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn("flex gap-1 rounded-full bg-muted p-1", className)}
    >
      {options.map(
        ({ value: optionValue, label: text, ariaLabel, icon: Icon }) => {
          const selected = value === optionValue;
          return (
            <Button
              key={optionValue}
              role="radio"
              aria-checked={selected}
              aria-label={ariaLabel}
              tabIndex={selected ? 0 : -1}
              variant="ghost"
              size={compact ? "sm" : "default"}
              onClick={() => onChange(optionValue)}
              className={cn(
                "min-w-11 rounded-full text-xs font-semibold text-muted-foreground",
                !compact && "flex-1",
                selected &&
                  "bg-brand text-brand-foreground elevation-1 hover:bg-brand hover:text-brand-foreground",
              )}
            >
              {Icon && <Icon className="size-3.5" aria-hidden />}
              {text}
            </Button>
          );
        },
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import { SelectIndicator } from "@/components/settings/SelectIndicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SelectRowProps = {
  selected: boolean;
  shape: "checkbox" | "radio";
  onSelect: () => void;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  trailingReserve?: string;
  muted?: boolean;
};

export function SelectRow({
  selected,
  shape,
  onSelect,
  title,
  subtitle,
  trailing,
  trailingReserve,
  muted = false,
}: SelectRowProps) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={onSelect}
        className={cn(
          "h-auto w-full justify-start gap-3 rounded-md px-4 py-3.5 text-left",
          trailingReserve,
          selected &&
            "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          muted && "opacity-50",
        )}
      >
        <SelectIndicator selected={selected} shape={shape} inverted />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{title}</span>
          {subtitle && (
            <span
              className={cn(
                "mt-0.5 block text-xs font-normal",
                selected
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {subtitle}
            </span>
          )}
        </span>
      </Button>
      {trailing && (
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
          {trailing}
        </div>
      )}
    </div>
  );
}

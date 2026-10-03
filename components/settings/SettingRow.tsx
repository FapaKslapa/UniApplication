import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile, type IconTone } from "@/components/settings/IconTile";
import { cn } from "@/lib/utils";

type SettingRowProps = {
  icon: LucideIcon;
  tone?: IconTone;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
  stackTrailing?: boolean;
};

export function SettingRow({
  icon,
  tone,
  title,
  subtitle,
  trailing,
  stackTrailing = false,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3.5",
        stackTrailing && "flex-wrap gap-y-3",
      )}
    >
      <IconTile icon={icon} tone={tone} />
      <div className={cn("min-w-0 flex-1", stackTrailing && "basis-40")}>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {trailing}
    </div>
  );
}

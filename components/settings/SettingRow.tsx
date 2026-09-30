import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile, type IconTone } from "@/components/settings/IconTile";

type SettingRowProps = {
  icon: LucideIcon;
  tone?: IconTone;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
};

export function SettingRow({
  icon,
  tone,
  title,
  subtitle,
  trailing,
}: SettingRowProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {trailing}
    </div>
  );
}

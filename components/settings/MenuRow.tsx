import { ChevronRight, type LucideIcon } from "lucide-react";
import { IconTile, type IconTone } from "@/components/settings/IconTile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MenuRowProps = {
  icon: LucideIcon;
  tone?: IconTone;
  title: string;
  subtitle: string;
  badge?: string;
  disabled?: boolean;
  hideChevron?: boolean;
  onClick: () => void;
};

export function MenuRow({
  icon,
  tone,
  title,
  subtitle,
  badge,
  disabled,
  hideChevron,
  onClick,
}: MenuRowProps) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className="h-auto w-full justify-start gap-4 rounded-none px-4 py-3.5 text-left"
    >
      <IconTile icon={icon} tone={tone} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
          {subtitle}
        </span>
      </span>
      {badge && <Badge variant="secondary">{badge}</Badge>}
      {!hideChevron && !badge && (
        <ChevronRight className="size-4 text-muted-foreground" />
      )}
    </Button>
  );
}

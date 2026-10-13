import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type DrawerHeadingProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DrawerHeading({
  icon: Icon,
  title,
  description,
  action,
}: DrawerHeadingProps) {
  return (
    <DrawerHeader className="flex-row items-center gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background elevation-1">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <DrawerTitle className="text-xl">{title}</DrawerTitle>
        {description && <DrawerDescription>{description}</DrawerDescription>}
      </div>
      {action}
    </DrawerHeader>
  );
}

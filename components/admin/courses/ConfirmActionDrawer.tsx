import { ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Course } from "@/lib/courses";
import { cn } from "@/lib/utils";

type ActionType = "approve" | "reject" | "delete" | "verify";

const actionVerb: Record<ActionType, string> = {
  approve: "approvare",
  reject: "rifiutare",
  delete: "eliminare",
  verify: "verificare",
};

interface ConfirmActionDrawerProps {
  open: boolean;
  action: ActionType | null;
  course: Course | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmActionDrawer({
  open,
  action,
  course,
  onClose,
  onConfirm,
}: ConfirmActionDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-popover">
        <DrawerHeader className="flex-row items-center gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full elevation-1",
              action === "delete"
                ? "bg-destructive/15 text-destructive"
                : "bg-foreground text-background",
            )}
          >
            {action === "delete" ? (
              <Trash2 className="size-5" />
            ) : (
              <ShieldCheck className="size-5" />
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <DrawerTitle className="text-xl">Conferma operazione</DrawerTitle>
            <DrawerDescription>
              Stai per {action ? actionVerb[action] : ""} il corso{" "}
              <span className="font-semibold text-foreground">
                {course?.name}
              </span>
              .
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <DrawerFooter className="flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            type="button"
            variant={action === "delete" ? "destructive" : "default"}
            onClick={onConfirm}
            className="flex-1"
          >
            Conferma
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

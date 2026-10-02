import { ShieldCheck, Trash2 } from "lucide-react";
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
      <DrawerContent>
        <DrawerHeader className="items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            {action === "delete" ? (
              <Trash2 className="text-red-500" />
            ) : (
              <ShieldCheck className="text-blue-500" />
            )}
          </div>
          <DrawerTitle>Conferma operazione</DrawerTitle>
          <DrawerDescription>
            Stai per {action ? actionVerb[action] : ""} il corso{" "}
            <span className="text-zinc-900 dark:text-white font-bold">
              {course?.name}
            </span>
            .
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 font-bold text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-white transition-transform active:scale-95 shadow-lg",
              action === "delete"
                ? "bg-red-500 shadow-red-500/20"
                : "bg-zinc-900 dark:bg-white dark:text-black shadow-zinc-900/20",
            )}
          >
            Conferma
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

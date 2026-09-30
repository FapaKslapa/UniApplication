"use client";

import { BellRing, Calendar } from "lucide-react";
import { ChangeCard } from "@/components/home/ChangeCard";
import type { TimetableChange } from "@/components/home/types";
import { weekOffsetForDate } from "@/components/home/weekOffsetForDate";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface NotificationChangeDialogProps {
  changes: TimetableChange[] | null;
  onClose: () => void;
  onNavigate: (weekOffset: number) => void;
}

export function NotificationChangeDialog({
  changes,
  onClose,
  onNavigate,
}: NotificationChangeDialogProps) {
  if (!changes) return null;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] rounded-t-xl bg-popover p-0"
      >
        <SheetHeader className="flex-row items-center gap-4 p-6">
          <div className="rounded-md bg-foreground p-3 text-background">
            <BellRing className="size-5" />
          </div>
          <div className="text-left">
            <SheetTitle className="text-xl">Aggiornamenti</SheetTitle>
            <SheetDescription>
              {changes.length}{" "}
              {changes.length === 1
                ? "variazione rilevata"
                : "variazioni rilevate"}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="max-h-[50dvh] space-y-3 overflow-y-auto px-5 custom-scrollbar">
          {changes.map((change) => (
            <ChangeCard
              key={`${change.type}-${change.date}-${change.time}-${change.title}`}
              change={change}
            />
          ))}
        </div>

        <SheetFooter className="p-5">
          <Button
            variant="secondary"
            onClick={() => onNavigate(weekOffsetForDate(changes[0].date))}
          >
            <Calendar className="size-4" />
            Vai al giorno
          </Button>
          <Button onClick={onClose}>Ho capito</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

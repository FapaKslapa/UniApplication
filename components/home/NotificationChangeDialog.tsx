"use client";

import { m } from "framer-motion";
import { BellRing, Calendar } from "lucide-react";
import { ChangeCard } from "@/components/home/ChangeCard";
import type { TimetableChange } from "@/components/home/types";
import { weekOffsetForDate } from "@/components/home/weekOffsetForDate";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { fadeUpVariants } from "@/lib/motion";

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
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-popover">
        <DrawerHeader className="flex-row items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background elevation-1">
            <BellRing className="size-5" />
          </div>
          <div className="text-left">
            <DrawerTitle className="text-xl">Aggiornamenti</DrawerTitle>
            <DrawerDescription>
              {changes.length}{" "}
              {changes.length === 1
                ? "variazione rilevata"
                : "variazioni rilevate"}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <div className="max-h-[50dvh] space-y-3 overflow-y-auto overscroll-contain px-5 custom-scrollbar">
          {changes.map((change, index) => (
            <m.div
              key={`${change.type}-${change.date}-${change.time}-${change.title}`}
              custom={index}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <ChangeCard change={change} />
            </m.div>
          ))}
        </div>

        <DrawerFooter>
          <Button
            variant="secondary"
            onClick={() => onNavigate(weekOffsetForDate(changes[0].date))}
          >
            <Calendar className="size-4" />
            Vai al giorno
          </Button>
          <Button onClick={onClose}>Ho capito</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

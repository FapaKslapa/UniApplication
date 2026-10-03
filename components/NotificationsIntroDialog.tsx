"use client";

import { BellRing, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

type NotificationsIntroDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfigure: () => void;
};

export function NotificationsIntroDialog({
  isOpen,
  onClose,
  onConfigure,
}: NotificationsIntroDialogProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerTitle className="sr-only">Notifiche push</DrawerTitle>
        <div className="flex flex-col items-center px-8 pt-2 pb-6 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-xl bg-muted text-foreground">
            <BellRing className="size-7" aria-hidden />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold leading-tight tracking-tight">
              Attiva le notifiche
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ti avvisiamo subito se cambia un'aula o salta una lezione, solo
              per le materie che segui. Puoi attivarle dalle impostazioni.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-8 pb-8">
          <Button onClick={onConfigure} size="lg" className="w-full">
            <span>Vai alle impostazioni</span>
            <ChevronRight className="size-4" />
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Non ora
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

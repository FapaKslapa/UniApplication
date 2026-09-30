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
          <div className="mb-6 flex size-16 items-center justify-center rounded-xl bg-muted">
            <BellRing className="size-7 text-foreground" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold leading-tight tracking-tight">
              Attiva le notifiche
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Non perderti più un cambio d'aula o una lezione annullata. Attiva
              le notifiche push per ricevere avvisi in tempo reale solo sulle
              materie che segui.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-8 pb-8">
          <Button onClick={onConfigure} size="lg" className="w-full">
            <span>Configura ora</span>
            <ChevronRight className="size-4" />
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Magari più tardi
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

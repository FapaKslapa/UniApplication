"use client";

import { BellRing, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { DrawerHeading } from "@/components/ui/drawer-heading";

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
      <DrawerContent className="bg-popover">
        <DrawerHeading
          icon={BellRing}
          title="Attiva le notifiche"
          description="Ti avvisiamo subito se cambia un'aula o salta una lezione, solo per le materie che segui. Puoi attivarle dalle opzioni."
        />
        <DrawerFooter className="pb-8">
          <Button onClick={onConfigure} size="lg" className="w-full">
            <span>Vai alle opzioni</span>
            <ChevronRight />
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Non ora
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

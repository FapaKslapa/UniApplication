"use client";

import { it } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import type { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type DatePickerDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: DateTime;
  today: DateTime;
  onDateChange: (date: DateTime) => void;
  onGoToday: () => void;
};

export function DatePickerDrawer({
  open,
  onOpenChange,
  selectedDate,
  today,
  onDateChange,
  onGoToday,
}: DatePickerDrawerProps) {
  const isToday = selectedDate.hasSame(today, "day");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-popover">
        <DrawerHeader className="flex-row items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background elevation-1">
            <CalendarDays className="size-5" />
          </div>
          <div className="text-left">
            <DrawerTitle className="text-xl">Vai alla data</DrawerTitle>
            <DrawerDescription>
              Scegli un giorno per saltare direttamente all&apos;agenda
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="flex justify-center px-2 pb-2">
          <Calendar
            mode="single"
            locale={it}
            selected={selectedDate.toJSDate()}
            onSelect={(date) => {
              if (!date) return;
              onDateChange(
                selectedDate.set({
                  year: date.getFullYear(),
                  month: date.getMonth() + 1,
                  day: date.getDate(),
                }),
              );
              onOpenChange(false);
            }}
            className="bg-transparent"
          />
        </div>
        <DrawerFooter>
          <Button
            variant="secondary"
            size="lg"
            disabled={isToday}
            onClick={() => {
              onGoToday();
              onOpenChange(false);
            }}
          >
            Vai a oggi
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

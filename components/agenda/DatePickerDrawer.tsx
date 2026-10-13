"use client";

import { CalendarDays } from "lucide-react";
import type { DateTime } from "luxon";
import { it } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { DrawerHeading } from "@/components/ui/drawer-heading";

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
        <DrawerHeading
          icon={CalendarDays}
          title="Vai alla data"
          description="Scegli un giorno per saltare direttamente all'agenda"
        />
        <div className="mx-auto w-full max-w-md px-4 pb-2">
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

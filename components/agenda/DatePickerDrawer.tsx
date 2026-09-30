"use client";

import { it } from "date-fns/locale";
import type { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Vai alla data</DrawerTitle>
        </DrawerHeader>
        <div className="flex justify-center">
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

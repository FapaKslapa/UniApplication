"use client";

import type { DateTime } from "luxon";
import { useState } from "react";
import { shiftDays, shiftWeeks, startOfDay } from "@/lib/agenda/dates";

type Options = {
  selectedDate: DateTime;
  onSelectedDateChange: (date: DateTime) => void;
};

export function useAgendaNavigation({
  selectedDate,
  onSelectedDateChange,
}: Options) {
  const [direction, setDirection] = useState(0);

  const select = (date: DateTime) => {
    setDirection(date.toMillis() >= selectedDate.toMillis() ? 1 : -1);
    onSelectedDateChange(startOfDay(date));
  };

  const shiftDay = (delta: -1 | 1) => {
    setDirection(delta);
    onSelectedDateChange(shiftDays(selectedDate, delta));
  };

  const shiftWeek = (delta: -1 | 1) => {
    setDirection(delta);
    onSelectedDateChange(shiftWeeks(selectedDate, delta));
  };

  const goToday = (today: DateTime) => select(today);

  return { direction, select, shiftDay, shiftWeek, goToday };
}

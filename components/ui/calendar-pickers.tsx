"use client";

import { DateTime } from "luxon";
import * as React from "react";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  DateTime.local(2000, i + 1, 1)
    .setLocale("it")
    .toFormat("LLLL"),
);

type PickerProps = {
  date: Date;
  onPick: (value: number) => void;
};

export function YearGrid({ date, onPick }: PickerProps) {
  const selectedYear = date.getFullYear();
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);
  }, []);

  React.useEffect(() => {
    const id = setTimeout(() => {
      document
        .getElementById(`year-${selectedYear}`)
        ?.scrollIntoView({ block: "center", behavior: "auto" });
    }, 10);
    return () => clearTimeout(id);
  }, [selectedYear]);

  return (
    <div className="grid h-full grid-cols-4 content-start gap-2 overflow-y-auto p-1">
      {years.map((year) => (
        <Button
          key={year}
          id={`year-${year}`}
          variant={year === selectedYear ? "default" : "ghost"}
          className="h-11 w-full rounded-full px-0"
          onClick={() => onPick(year)}
        >
          {year}
        </Button>
      ))}
    </div>
  );
}

export function MonthGrid({ date, onPick }: PickerProps) {
  return (
    <div className="grid grid-cols-3 content-start gap-2 py-2">
      {MONTH_NAMES.map((month, index) => (
        <Button
          key={month}
          variant={index === date.getMonth() ? "default" : "ghost"}
          className="h-11 w-full rounded-full px-0 capitalize"
          onClick={() => onPick(index)}
        >
          {month}
        </Button>
      ))}
    </div>
  );
}

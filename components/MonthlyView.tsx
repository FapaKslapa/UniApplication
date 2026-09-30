"use client";

import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { MonthLandscape } from "@/components/monthly-view/MonthLandscape";
import { MonthPortrait } from "@/components/monthly-view/MonthPortrait";
import {
  buildDaySchedule,
  buildMonthDays,
} from "@/components/monthly-view/monthGrid";
import type {
  MonthLayoutProps,
  MonthTab,
} from "@/components/monthly-view/types";
import { useMonthlyViewData } from "@/components/monthly-view/useMonthlyViewData";
import { useViewport } from "@/components/monthly-view/useViewport";
import type { DaySchedule } from "@/lib/orario-utils";

type MonthlyViewProps = {
  onDaySelect: (day: DaySchedule) => void;
  materiaColorMap: Record<string, string>;
};

export function MonthlyView({
  onDaySelect,
  materiaColorMap,
}: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(
    DateTime.now().setLocale("it"),
  );
  const [direction, setDirection] = useState(0);
  const [activeTab, setActiveTab] = useState<MonthTab>("calendar");
  const { isLandscape, showTabs } = useViewport();
  const data = useMonthlyViewData(currentDate, materiaColorMap);
  const days = useMemo(() => buildMonthDays(currentDate), [currentDate]);

  const shiftMonth = (delta: -1 | 1) => {
    setDirection(delta);
    setCurrentDate((prev) => prev.plus({ months: delta }));
  };

  const goToToday = () => {
    const now = DateTime.now().setLocale("it");
    setDirection(currentDate > now ? -1 : 1);
    setCurrentDate(now);
  };

  const layoutProps: MonthLayoutProps = {
    currentDate,
    direction,
    days,
    eventsByDate: data.eventsByDate,
    eventCount: data.eventCount,
    isFetching: data.isFetching,
    isCurrentMonth: currentDate.hasSame(DateTime.now(), "month"),
    activeTab,
    onTabChange: setActiveTab,
    materie: data.materie,
    hiddenSubjects: data.hiddenSubjects,
    colorFor: data.colorFor,
    onToggleSubject: data.toggleSubject,
    onPrevMonth: () => shiftMonth(-1),
    onNextMonth: () => shiftMonth(1),
    onToday: goToToday,
    onOpenDay: (date, events) =>
      onDaySelect(buildDaySchedule(date, events, materiaColorMap)),
  };

  return isLandscape ? (
    <MonthLandscape {...layoutProps} />
  ) : (
    <MonthPortrait {...layoutProps} showTabs={showTabs} />
  );
}

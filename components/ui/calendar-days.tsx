"use client";

import {
  AnimatePresence,
  m,
  type PanInfo,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { it } from "react-day-picker/locale";
import { buttonVariants } from "@/components/ui/button-variants";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
const CLICK_GUARD_MS = 80;

const slideVariants: Variants = {
  enter: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -100}%`, opacity: 0 }),
};

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const selectedButton =
  "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground";

const DAY_CLASSNAMES = {
  months: "relative",
  month: "w-full",
  month_caption: "hidden",
  nav: "hidden",
  month_grid: "block w-full border-collapse [&>*]:block",
  weekdays: "grid grid-cols-7",
  weekday: "py-1 text-center text-[0.8rem] font-normal text-muted-foreground",
  weeks: "block",
  week: "mt-1 grid grid-cols-7",
  day: "relative flex h-11 items-center justify-center p-0 text-center text-sm focus-within:z-20",
  day_button: cn(
    buttonVariants({ variant: "ghost" }),
    "size-11 rounded-full p-0 font-normal aria-selected:opacity-100",
    "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
  ),
  range_end: "day-range-end",
  range_start: "day-range-start",
  selected: selectedButton,
  today:
    "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button:hover]:bg-accent",
  outside: "day-outside text-muted-foreground opacity-50",
  disabled: "text-muted-foreground opacity-50",
  range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
  hidden: "invisible",
};

type DayPickerProps = React.ComponentProps<typeof DayPicker>;

type CalendarDaysProps = {
  month: Date;
  direction: number;
  onShift: (delta: number) => void;
  onMonthChange: (date: Date) => void;
  classNames?: DayPickerProps["classNames"];
  showOutsideDays: boolean;
  dayPickerProps: DayPickerProps;
};

export function CalendarDays({
  month,
  direction,
  onShift,
  onMonthChange,
  classNames,
  showOutsideDays,
  dayPickerProps,
}: CalendarDaysProps) {
  const reduceMotion = useReducedMotion();
  const dragged = React.useRef(false);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onShift(1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY)
      onShift(-1);
    setTimeout(() => {
      dragged.current = false;
    }, CLICK_GUARD_MS);
  };

  const blockClickAfterDrag = (event: React.MouseEvent) => {
    if (!dragged.current) return;
    event.stopPropagation();
    event.preventDefault();
  };

  const key = `${month.getFullYear()}-${month.getMonth()}`;

  return (
    <m.div
      drag="x"
      dragDirectionLock
      dragElastic={0.2}
      dragConstraints={{ left: 0, right: 0 }}
      dragSnapToOrigin
      dragMomentum={false}
      onDragStart={() => {
        dragged.current = true;
      }}
      onDragEnd={handleDragEnd}
      onClickCapture={blockClickAfterDrag}
      className="touch-pan-y"
    >
      <div className="relative overflow-hidden px-1 pb-1">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <m.div
            key={key}
            custom={direction}
            variants={reduceMotion ? fadeVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              reduceMotion
                ? { duration: 0.15, ease: "easeOut" }
                : springs.smooth
            }
          >
            <DayPicker
              locale={it}
              weekStartsOn={1}
              fixedWeeks
              showOutsideDays={showOutsideDays}
              month={month}
              onMonthChange={onMonthChange}
              className="p-0"
              classNames={{ ...DAY_CLASSNAMES, ...classNames }}
              {...dayPickerProps}
            />
          </m.div>
        </AnimatePresence>
      </div>
    </m.div>
  );
}

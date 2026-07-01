"use client";

import { it } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  ArrowLeftToLine,
  Calendar as CalendarOff,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api";
import {
  addDays,
  getCurrentItalianDateTime,
  getDayOfWeek,
} from "@/lib/date-utils";
import type { DaySchedule } from "@/lib/orario-utils";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

const SPRING = {
  type: "spring",
  stiffness: 350,
  damping: 35,
  mass: 1,
} as const;

interface CalendarViewProps {
  schedule: DaySchedule[];
  weekOffset: number;
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onReset: () => void;
  onSetOffset: (offset: number) => void;
  onDaySelect?: (day: DaySchedule | null) => void;
  selectedDay?: DaySchedule | null;
  materiaColorMap: Record<string, string>;
}

export function CalendarView({
  schedule,
  weekOffset,
  onNextWeek,
  onPrevWeek,
  onReset,
  onSetOffset,
  onDaySelect,
  selectedDay,
  materiaColorMap,
}: CalendarViewProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { hiddenSubjects, setHiddenSubjects } = useAppStore();
  const [direction, setDirection] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const updateFiltersMutation =
    api.notifications.updateAllFilters.useMutation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowFilterPanel(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrevWeek = () => {
    setDirection(-1);
    onPrevWeek();
  };
  const handleNextWeek = () => {
    setDirection(1);
    onNextWeek();
  };
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) handleNextWeek();
    else if (info.offset.x > 50) handlePrevWeek();
  };
  const handleCalendarDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50)
      setCalendarMonth((p) => {
        const d = new Date(p);
        d.setMonth(d.getMonth() + 1);
        return d;
      });
    else if (info.offset.x > 50)
      setCalendarMonth((p) => {
        const d = new Date(p);
        d.setMonth(d.getMonth() - 1);
        return d;
      });
  };

  const allMaterie = useMemo(
    () => schedule.flatMap((day) => day.events.map((ev) => ev.materia)),
    [schedule],
  );

  const toggleSubject = (materia: string) => {
    const newHidden = hiddenSubjects.includes(materia)
      ? hiddenSubjects.filter((s) => s !== materia)
      : [...hiddenSubjects, materia];
    setHiddenSubjects(newHidden);
    if ("Notification" in window && Notification.permission === "granted") {
      updateFiltersMutation.mutate({ filters: newHidden });
    }
  };

  const today = getCurrentItalianDateTime();
  const baseDate = addDays(today, weekOffset);
  const startOfWeek = baseDate.minus({ days: getDayOfWeek(baseDate) });
  const weekRangeDisplay = `${startOfWeek.toFormat("d")} — ${startOfWeek.plus({ days: 6 }).setLocale("it").toFormat("d MMM yyyy")}`;

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const currentDate = startOfWeek.plus({ days: i });
        const dayOfWeek = getDayOfWeek(currentDate);
        const dayData = schedule.find((s) => s.day === dayOfWeek);
        const nonCancelledEvents = (dayData?.events || []).filter(
          (ev) =>
            !ev.time?.toUpperCase().includes("ANNULLATO") &&
            !hiddenSubjects.includes(ev.materia),
        );
        return {
          day: dayOfWeek,
          dayOfMonth: currentDate.day,
          date: currentDate,
          events: nonCancelledEvents,
          hasEvents: nonCancelledEvents.length > 0,
        };
      }),
    [startOfWeek, schedule, hiddenSubjects],
  );

  const getMateriaColor = (materia: string) => {
    const norm = materia.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
    return materiaColorMap[norm] || "#888888";
  };

  const DAY_HEADERS = ["L", "M", "M", "G", "V", "S", "D"];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 36 : -36, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 36 : -36, opacity: 0 }),
  };

  return (
    <div className="w-full flex-1 min-h-0 nothing-widget overflow-hidden flex flex-col">
      <div className="flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800/60">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          className="touch-none"
        >
          <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-1">
            <div className="flex items-center gap-0.5 shrink-0">
              {weekOffset !== 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors active:scale-90"
                >
                  <ArrowLeftToLine className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePrevWeek}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors active:scale-90"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>

            <Popover
              open={isCalendarOpen}
              onOpenChange={(o) => {
                setIsCalendarOpen(o);
                if (o) setCalendarMonth(baseDate.toJSDate());
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 flex-1 justify-center min-w-0 active:scale-95 transition-transform font-bold"
                >
                  <span className="truncate">{weekRangeDisplay}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white dark:bg-[#0D0D0D] border border-zinc-200 dark:border-white/8 rounded-3xl shadow-2xl overflow-hidden"
                align="center"
              >
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleCalendarDragEnd}
                  className="touch-none"
                >
                  <Calendar
                    mode="single"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    selected={baseDate.toJSDate()}
                    onSelect={(d) => {
                      if (d) {
                        const diff = Math.floor(
                          DateTime.fromJSDate(d)
                            .minus({
                              days: getDayOfWeek(DateTime.fromJSDate(d)),
                            })
                            .diff(
                              today.minus({ days: getDayOfWeek(today) }),
                              "days",
                            ).days,
                        );
                        setDirection(diff > weekOffset ? 1 : -1);
                        onSetOffset(diff);
                        setIsCalendarOpen(false);
                      }
                    }}
                    locale={it}
                    className="font-mono"
                  />
                </motion.div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={handleNextWeek}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors active:scale-90"
              >
                <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
              <button
                type="button"
                onClick={() => setShowFilterPanel((p) => !p)}
                className={cn(
                  "p-1.5 rounded-xl transition-colors active:scale-90",
                  showFilterPanel
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400",
                )}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="px-3 pb-3">
            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {DAY_HEADERS.map((h, idx) => (
                <div key={idx} className="text-center">
                  <span className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600">
                    {h}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative w-full aspect-[7.5/1] min-h-[52px]">
              <AnimatePresence
                initial={false}
                custom={direction}
                mode="popLayout"
              >
                <motion.div
                  key={weekOffset}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SPRING}
                  className="grid grid-cols-7 gap-1 absolute inset-0"
                >
                  {weekDays.map((dayData) => {
                    const isToday = dayData.date.hasSame(today, "day");
                    const isSelected = selectedDay?.day === dayData.day;
                    const uniqueMaterie = Array.from(
                      new Set(dayData.events.map((e) => e.materia)),
                    );

                    return (
                      <button
                        key={dayData.day}
                        type="button"
                        onClick={() => {
                          if (dayData.hasEvents && onDaySelect)
                            onDaySelect({ ...dayData, materiaColorMap });
                        }}
                        disabled={!dayData.hasEvents}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-[3px] py-1.5 rounded-[10px] transition-all",
                          dayData.hasEvents
                            ? isSelected
                              ? "bg-zinc-900 dark:bg-white"
                              : isToday
                                ? "bg-[#FF2B2B]/8 dark:bg-[#FF2B2B]/12"
                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
                            : "opacity-20 cursor-default",
                        )}
                      >
                        {isToday && !isSelected && (
                          <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#FF2B2B]" />
                        )}
                        <span
                          className={cn(
                            "text-[12px] font-mono font-black tabular-nums leading-none",
                            isSelected
                              ? "text-white dark:text-zinc-900"
                              : isToday
                                ? "text-[#FF2B2B]"
                                : "text-zinc-800 dark:text-zinc-200",
                          )}
                        >
                          {dayData.dayOfMonth}
                        </span>

                        {dayData.hasEvents && (
                          <div className="flex gap-[2px] items-center justify-center">
                            {uniqueMaterie.slice(0, 3).map((m, mi) => (
                              <div
                                key={`${m}-${mi}`}
                                className="w-[5px] h-[5px] rounded-full shrink-0"
                                style={
                                  isSelected
                                    ? {
                                        backgroundColor:
                                          "rgba(255,255,255,0.4)",
                                      }
                                    : { backgroundColor: getMateriaColor(m) }
                                }
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="px-4 py-3 nth-header">
              <p className="nth-label text-zinc-500 dark:text-zinc-400 mb-3">
                Filtra Materie
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {Array.from(new Set(allMaterie))
                  .sort()
                  .map((materia) => {
                    const isHidden = hiddenSubjects.includes(materia);
                    return (
                      <button
                        key={materia}
                        type="button"
                        onClick={() => toggleSubject(materia)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-[14px] border transition-all text-left active:scale-95",
                          isHidden
                            ? "opacity-30 bg-transparent border-transparent"
                            : "bg-white dark:bg-white/5 border-black/6 dark:border-white/8",
                        )}
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: getMateriaColor(materia) }}
                        />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-tight truncate flex-1 text-zinc-700 dark:text-zinc-300">
                          {materia.toLowerCase()}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="p-3 space-y-2 pb-4">
          {weekDays
            .filter((d) => d.hasEvents)
            .map((dayData) => {
              const isToday = dayData.date.hasSame(today, "day");
              const isSelected = selectedDay?.day === dayData.day;
              const DAY_NAMES = [
                "Lun",
                "Mar",
                "Mer",
                "Gio",
                "Ven",
                "Sab",
                "Dom",
              ];
              const uniqueMaterie = Array.from(
                new Set(dayData.events.map((e) => e.materia)),
              );

              return (
                <motion.button
                  key={dayData.day}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: dayData.day * 0.04,
                    duration: 0.25,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  type="button"
                  onClick={() => {
                    if (onDaySelect)
                      onDaySelect({ ...dayData, materiaColorMap });
                  }}
                  className={cn(
                    "card-3d w-full rounded-[18px] border transition-all active:scale-[0.99] text-left overflow-hidden",
                    isSelected
                      ? "bg-zinc-900 dark:bg-white border-zinc-800 dark:border-white"
                      : isToday
                        ? "bg-white dark:bg-zinc-900 border-[#FF2B2B]/30"
                        : "bg-white dark:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800/60",
                  )}
                >
                  <div className="flex items-stretch gap-0">
                    <div
                      className={cn(
                        "shrink-0 w-[64px] flex flex-col items-center justify-center px-2 py-4 border-r",
                        isSelected
                          ? "border-zinc-800 dark:border-white/10"
                          : "border-zinc-100 dark:border-zinc-800/60",
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono font-black text-[1.75rem] leading-none tabular-nums",
                          isSelected
                            ? "text-white dark:text-zinc-900"
                            : isToday
                              ? "text-[#FF2B2B]"
                              : "text-zinc-900 dark:text-white",
                        )}
                        style={{ letterSpacing: "-0.04em" }}
                      >
                        {dayData.dayOfMonth.toString().padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[9px] uppercase tracking-[0.15em] mt-0.5",
                          isSelected
                            ? "text-white/40 dark:text-zinc-900/50"
                            : "text-zinc-400",
                        )}
                      >
                        {DAY_NAMES[dayData.day]}
                      </span>
                      {isToday && !isSelected && (
                        <div
                          className="w-1 h-1 rounded-full mt-1.5"
                          style={{ backgroundColor: "#FF2B2B" }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center gap-1">
                      {uniqueMaterie.slice(0, 3).map((m) => (
                        <p
                          key={m}
                          className={cn(
                            "font-mono text-[10px] font-bold uppercase tracking-tight truncate leading-snug",
                            isSelected
                              ? "text-white/80 dark:text-zinc-900/80"
                              : "text-zinc-700 dark:text-zinc-300",
                          )}
                        >
                          {m}
                        </p>
                      ))}
                      {uniqueMaterie.length > 3 && (
                        <p
                          className={cn(
                            "font-mono text-[9px] uppercase tracking-tight",
                            isSelected ? "text-white/35" : "text-zinc-400",
                          )}
                        >
                          +{uniqueMaterie.length - 3} altri
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center justify-center pr-4">
                      <span
                        className={cn(
                          "font-mono font-black text-[1.1rem] tabular-nums",
                          isSelected
                            ? "text-white/30 dark:text-zinc-900/30"
                            : isToday
                              ? "text-[#FF2B2B]/50"
                              : "text-zinc-300 dark:text-zinc-700",
                        )}
                        style={{ letterSpacing: "-0.04em" }}
                      >
                        {dayData.events.length}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}

          {weekDays.filter((d) => d.hasEvents).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <CalendarOff
                className="w-8 h-8 text-zinc-200 dark:text-zinc-800"
                strokeWidth={1}
              />
              <p className="nth-label text-zinc-400 dark:text-zinc-600">
                Nessuna lezione questa settimana
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

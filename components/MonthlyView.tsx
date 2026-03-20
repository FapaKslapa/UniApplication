"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftToLine,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  MoreHorizontal,
  Video,
} from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import type { DaySchedule } from "@/lib/orario-utils";
import { getMateriaColorMap, parseEventTitle } from "@/lib/orario-utils";
import { useActiveLinkIds, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = {
  type: "spring",
  stiffness: 350,
  damping: 35,
  mass: 1,
} as const;

interface MonthlyViewProps {
  onDaySelect: (day: DaySchedule) => void;
  materiaColorMap: Record<string, string>;
}

export function MonthlyView({
  onDaySelect,
  materiaColorMap,
}: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(
    DateTime.now().setLocale("it"),
  );
  const {
    hiddenSubjects,
    setHiddenSubjects,
    professorName,
    userRole,
    location,
  } = useAppStore();
  const activeLinkIds = useActiveLinkIds();

  const [direction, setDirection] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [_isMobile, setIsMobile] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    DateTime.now().setLocale("it"),
  );
  const [activeTab, setActiveTab] = useState<"calendar" | "filters">(
    "calendar",
  );
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  const updateFiltersMutation =
    api.notifications.updateAllFilters.useMutation();

  useEffect(() => {
    const check = () => {
      const landscape =
        window.innerWidth > window.innerHeight && window.innerHeight < 600;
      setIsLandscape(landscape);
      setIsMobile(window.innerWidth < 1024);
      setShowTabs(window.innerHeight < 750);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { data: monthlyEvents = [], isFetching } =
    api.orario.getMonthlyOrario.useQuery(
      {
        year: currentDate.year,
        month: currentDate.month,
        linkIds: activeLinkIds.length > 0 ? activeLinkIds : undefined,
        location,
        professorName: userRole === "professor" ? professorName : undefined,
      },
      {
        enabled:
          activeLinkIds.length > 0 ||
          (userRole === "professor" && !!professorName),
        placeholderData: (previousData) => previousData,
      },
    );

  const allMaterie = useMemo(() => {
    const subjects = new Set<string>();
    for (const e of monthlyEvents) {
      subjects.add(parseEventTitle(e.title).materia);
    }
    return Array.from(subjects).sort();
  }, [monthlyEvents]);

  const internalColorMap = useMemo(
    () => getMateriaColorMap(allMaterie),
    [allMaterie],
  );

  const getMateriaColor = (materia: string) => {
    const normalized = materia
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    return (
      internalColorMap[normalized] ?? materiaColorMap[normalized] ?? "#666666"
    );
  };

  const toggleSubject = (materia: string) => {
    const newHidden = hiddenSubjects.includes(materia)
      ? hiddenSubjects.filter((s) => s !== materia)
      : [...hiddenSubjects, materia];

    setHiddenSubjects(newHidden);

    if ("Notification" in window && Notification.permission === "granted") {
      updateFiltersMutation.mutate({ filters: newHidden });
    }
  };

  const selectedDayEvents = useMemo(() => {
    const iso = selectedDate.toISODate();
    return monthlyEvents.filter(
      (e) =>
        e.date === iso &&
        !hiddenSubjects.includes(parseEventTitle(e.title).materia),
    );
  }, [monthlyEvents, selectedDate, hiddenSubjects]);

  const monthName = currentDate.toFormat("MMMM");
  const yearName = currentDate.toFormat("yyyy");
  const isCurrentMonth = currentDate.hasSame(DateTime.now(), "month");

  const daysInMonth = useMemo(() => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const firstDayOfWeek = startOfMonth.weekday;
    const days = [];

    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push({
        date: startOfMonth.minus({ days: firstDayOfWeek - i }),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= (currentDate.daysInMonth ?? 0); i++) {
      days.push({
        date: startOfMonth.plus({ days: i - 1 }),
        isCurrentMonth: true,
      });
    }

    const totalCells = 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: endOfMonth.plus({ days: i }),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate((prev) => prev.minus({ months: 1 }));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate((prev) => prev.plus({ months: 1 }));
  };

  const handleToday = () => {
    const now = DateTime.now();
    setDirection(currentDate > now ? -1 : 1);
    setCurrentDate(now.setLocale("it"));
    setSelectedDate(now.setLocale("it"));
  };

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (d: number) => ({
      x: d < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const NavigationControls = () => (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleToday}
              className={cn(
                "p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all rounded-lg active:scale-90",
                isCurrentMonth && "opacity-0 pointer-events-none",
              )}
            >
              <ArrowLeftToLine className="w-4 h-4 text-zinc-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Vai a Oggi</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-1 gap-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all rounded-lg active:scale-90"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all rounded-lg active:scale-90"
        >
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );

  const ViewTabs = ({ className }: { className?: string }) => (
    <Popover open={isViewMenuOpen} onOpenChange={setIsViewMenuOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all active:scale-90 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800",
            className,
          )}
        >
          <MoreHorizontal className="w-5 h-5 text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-40 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl"
      >
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("calendar");
              setIsViewMenuOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === "calendar"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
            )}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Mese</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("filters");
              setIsViewMenuOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === "filters"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filtri</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (isLandscape) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_CONFIG}
        className="w-full h-full flex bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm relative"
      >
        <div className="w-[35%] min-w-[280px] max-w-[350px] border-r border-zinc-100 dark:border-zinc-900 flex flex-col bg-zinc-50/10 dark:bg-zinc-900/10">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="font-serif font-bold text-sm capitalize">
              {monthName} {yearName}
            </span>
            <NavigationControls />
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={currentDate.toFormat("yyyy-MM")}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={SPRING_CONFIG}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                dragDirectionLock
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) handleNextMonth();
                  else if (swipe > swipeConfidenceThreshold) handlePrevMonth();
                }}
                className="absolute inset-0 p-3 overflow-y-auto custom-scrollbar touch-pan-y"
              >
                <div className="grid grid-cols-7 gap-1">
                  {[
                    { l: "L", id: "mon" },
                    { l: "M", id: "tue" },
                    { l: "M", id: "wed" },
                    { l: "G", id: "thu" },
                    { l: "V", id: "fri" },
                    { l: "S", id: "sat" },
                    { l: "D", id: "sun" },
                  ].map((d) => (
                    <div
                      key={d.id}
                      className="text-center py-1 text-[8px] font-bold text-zinc-300 uppercase"
                    >
                      {d.l}
                    </div>
                  ))}
                  {daysInMonth.map((day) => {
                    const iso = day.date.toISODate();
                    if (!iso) return null;
                    const dayEvents = monthlyEvents.filter(
                      (e) =>
                        e.date === iso &&
                        !hiddenSubjects.includes(
                          parseEventTitle(e.title).materia,
                        ),
                    );
                    const isSelected = selectedDate.hasSame(day.date, "day");
                    const isCurrent = day.isCurrentMonth;
                    const isToday = day.date.hasSame(DateTime.now(), "day");
                    const uniqueMaterie = Array.from(
                      new Set(
                        dayEvents.map((e) => parseEventTitle(e.title).materia),
                      ),
                    );

                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => {
                          if (isCurrent) setSelectedDate(day.date);
                        }}
                        className={cn(
                          "rounded-lg flex flex-col items-center justify-between py-1.5 min-h-[44px] relative transition-all",
                          !isCurrent && "opacity-0 pointer-events-none",
                          isCurrent && isSelected
                            ? "bg-zinc-900 dark:bg-white shadow-md scale-105 z-10"
                            : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50",
                          isToday &&
                            !isSelected &&
                            "border border-zinc-900 dark:border-white",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-mono font-bold leading-none",
                            isSelected
                              ? "text-white dark:text-black"
                              : "text-zinc-500",
                          )}
                        >
                          {day.date.day}
                        </span>
                        <div className="flex flex-col items-center justify-center mb-0.5">
                          {uniqueMaterie.length > 0 && (
                            <div className="grid grid-cols-2 gap-0.5 p-0.5">
                              {(() => {
                                const displayMaterie =
                                  uniqueMaterie.length > 4
                                    ? uniqueMaterie.slice(0, 3)
                                    : uniqueMaterie.slice(0, 4);
                                const hasMore = uniqueMaterie.length > 4;
                                return (
                                  <>
                                    {displayMaterie.map((m) => (
                                      <div
                                        key={m}
                                        className={cn(
                                          "w-1 h-1 rounded-full shrink-0",
                                          isSelected
                                            ? "bg-white/75 dark:bg-black/75"
                                            : "",
                                        )}
                                        style={
                                          !isSelected
                                            ? {
                                                backgroundColor:
                                                  getMateriaColor(m),
                                              }
                                            : {}
                                        }
                                      />
                                    ))}
                                    {hasMore && (
                                      <div
                                        className={cn(
                                          "w-1 h-1 rounded-full shrink-0",
                                          isSelected
                                            ? "bg-white/30 dark:bg-black/30"
                                            : "bg-zinc-300 dark:bg-zinc-600",
                                        )}
                                      />
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black flex items-center justify-between sticky top-0 z-20">
            <ViewTabs />
            {isFetching && (
              <div className="w-4 h-4 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "calendar" ? (
              <div className="p-4 space-y-4">
                <h3 className="font-serif font-bold text-lg leading-none border-b border-zinc-50 dark:border-zinc-900/50 pb-4">
                  {selectedDate.toFormat("cccc d MMMM")}
                </h3>
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayEvents.map((e) => {
                      const parsed = parseEventTitle(e.title);
                      const color = getMateriaColor(parsed.materia);
                      return (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={`${e.date}-${e.time}-${parsed.materia}`}
                          type="button"
                          onClick={() =>
                            onDaySelect({
                              day: selectedDate.weekday - 1,
                              dayOfMonth: selectedDate.day,
                              date: selectedDate,
                              events: selectedDayEvents.map((ev) => ({
                                ...parseEventTitle(ev.title),
                                time: ev.time,
                                docente: ev.professor,
                                aula: ev.location,
                                isVideo: ev.isVideo,
                                fullDate: ev.date ?? undefined,
                              })),
                              materiaColorMap,
                            })
                          }
                          className="w-full text-left p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-4 active:scale-[0.98] transition-all group"
                        >
                          <div
                            className="w-1.5 h-12 rounded-full shrink-0 group-hover:scale-y-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                                  {e.time}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-white line-clamp-2 mb-1.5">
                              {parsed.materia}
                            </h4>
                            <div className="flex items-start gap-1.5 text-[10px] text-zinc-400">
                              {e.isVideo ? (
                                <Video className="w-3.5 h-3.5 shrink-0 text-blue-500 mt-0.5" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              )}
                              <span className="leading-tight whitespace-normal">
                                {e.location}
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center opacity-30 text-center">
                    <CalendarIcon className="w-10 h-10 mb-2" strokeWidth={1} />
                    <p className="font-serif italic text-sm">
                      Nessuna lezione per oggi
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="px-6 py-4 border-b border-zinc-50 dark:border-zinc-900/50 flex items-center gap-2 shrink-0">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                    Filtra Materie
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <div className="grid grid-cols-1 gap-2">
                    {allMaterie.map((materia) => {
                      const isHidden = hiddenSubjects.includes(materia);
                      return (
                        <button
                          key={materia}
                          type="button"
                          onClick={() => toggleSubject(materia)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                            isHidden
                              ? "bg-zinc-50 dark:bg-zinc-900/20 border-transparent opacity-40"
                              : "bg-white dark:bg-zinc-900/10 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 active:scale-[0.98]",
                          )}
                        >
                          <div
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{
                              backgroundColor: getMateriaColor(materia),
                            }}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-tight truncate flex-1 font-mono">
                            {materia.toLowerCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_CONFIG}
      className="w-full h-full flex flex-col bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm relative"
    >
      <div className="px-6 py-4 lg:px-8 lg:py-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/20 dark:bg-zinc-900/10 z-10">
        <div className="flex flex-col min-w-0">
          <h2 className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white font-serif capitalize leading-tight tracking-tight truncate">
            {monthName}
          </h2>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em] mt-1 lg:mt-2">
            {yearName}
          </span>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {isLandscape && <ViewTabs />}
          {showTabs && <ViewTabs />}
          {(!showTabs || activeTab === "calendar") && <NavigationControls />}
        </div>
      </div>

      {(!showTabs || activeTab === "calendar") && (
        <div className="grid grid-cols-7 px-3 lg:px-5 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
          {[
            { l: "L", id: "mon" },
            { l: "M", id: "tue" },
            { l: "M", id: "wed" },
            { l: "G", id: "thu" },
            { l: "V", id: "fri" },
            { l: "S", id: "sat" },
            { l: "D", id: "sun" },
          ].map((d) => (
            <div key={d.id} className="py-2.5 lg:py-4 text-center">
              <span className="text-[9px] lg:text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
                {d.l}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 relative flex flex-col items-center px-2 lg:px-6 py-1.5 lg:py-3 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full gap-1 lg:gap-4">
          {(!showTabs || activeTab === "calendar") && (
            <AnimatePresence mode="wait" custom={direction}>
              {isFetching && monthlyEvents.length === 0 ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-4"
                >
                  <div className="w-10 h-10 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-zinc-100 dark:border-zinc-900" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-400 dark:border-t-zinc-500 animate-spin" />
                  </div>
                  <p className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.25em]">
                    Caricamento...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={`grid-${currentDate.toFormat("yyyy-MM")}`}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SPRING_CONFIG}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  dragDirectionLock
                  onDragEnd={(_e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) handleNextMonth();
                    else if (swipe > swipeConfidenceThreshold)
                      handlePrevMonth();
                  }}
                  className="grid grid-cols-7 gap-1 lg:gap-3 w-full touch-pan-y shrink-0"
                >
                  {daysInMonth.map((day) => {
                    const isoDate = day.date.toISODate();
                    if (!isoDate) return null;
                    const dayEvents = monthlyEvents.filter(
                      (e) =>
                        e.date === isoDate &&
                        !hiddenSubjects.includes(
                          parseEventTitle(e.title).materia,
                        ),
                    );
                    const isToday = day.date.hasSame(DateTime.now(), "day");
                    const isCurrentMonth = day.isCurrentMonth;
                    const hasEvents = dayEvents.length > 0;
                    const uniqueMaterie = Array.from(
                      new Set(
                        dayEvents.map((e) => parseEventTitle(e.title).materia),
                      ),
                    );
                    const displayMaterie =
                      uniqueMaterie.length > 4
                        ? uniqueMaterie.slice(0, 3)
                        : uniqueMaterie.slice(0, 4);
                    const hasMore = uniqueMaterie.length > 4;

                    return (
                      <button
                        key={isoDate}
                        type="button"
                        onClick={() => {
                          if (hasEvents) {
                            onDaySelect({
                              day: day.date.weekday - 1,
                              dayOfMonth: day.date.day,
                              date: day.date,
                              events: dayEvents.map((e) => {
                                const parsed = parseEventTitle(e.title);
                                return {
                                  time: e.time,
                                  materia: parsed.materia,
                                  aula: e.location,
                                  docente: e.professor,
                                  tipo: parsed.tipo,
                                  isVideo: e.isVideo,
                                  fullDate: e.date ?? undefined,
                                };
                              }),
                              materiaColorMap,
                            });
                          }
                        }}
                        className={cn(
                          "relative flex flex-col items-center justify-between py-2.5 lg:py-3 min-h-[58px] lg:min-h-[80px] w-full rounded-2xl lg:rounded-3xl transition-all border",
                          !isCurrentMonth && "opacity-0 pointer-events-none",
                          isCurrentMonth &&
                            !isToday &&
                            !hasEvents &&
                            "bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900",
                          isCurrentMonth &&
                            hasEvents &&
                            !isToday &&
                            "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.96] cursor-pointer",
                          isToday &&
                            !hasEvents &&
                            "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white",
                          isToday &&
                            hasEvents &&
                            "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white active:scale-[0.96] cursor-pointer shadow-md",
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs lg:text-sm font-bold font-mono leading-none",
                            isToday
                              ? "text-white dark:text-black"
                              : hasEvents
                                ? "text-zinc-800 dark:text-zinc-100"
                                : "text-zinc-300 dark:text-zinc-700",
                          )}
                        >
                          {day.date.day}
                        </span>

                        <div className="grid grid-cols-2 gap-0.5 lg:gap-1 p-0.5">
                          {displayMaterie.map((m) => (
                            <div
                              key={m}
                              className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: isToday
                                  ? "rgba(255,255,255,0.75)"
                                  : getMateriaColor(m),
                              }}
                            />
                          ))}
                          {hasMore && (
                            <div
                              className={cn(
                                "w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full shrink-0",
                                isToday
                                  ? "bg-white/30 dark:bg-black/30"
                                  : "bg-zinc-300 dark:bg-zinc-600",
                              )}
                            />
                          )}
                          {uniqueMaterie.length === 0 && (
                            <>
                              <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full shrink-0 opacity-0" />
                              <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full shrink-0 opacity-0" />
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {(!showTabs || activeTab === "filters") && (
            <div className="w-full flex-1 min-h-0 flex flex-col pt-2">
              <div className="px-2 pb-2 flex items-center gap-2 shrink-0">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  Filtra Materie
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4">
                <div className="grid grid-cols-1 gap-1.5">
                  {allMaterie.map((materia) => {
                    const isHidden = hiddenSubjects.includes(materia);
                    return (
                      <button
                        key={materia}
                        type="button"
                        onClick={() => toggleSubject(materia)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
                          isHidden
                            ? "bg-transparent border-zinc-100 dark:border-zinc-900 opacity-40"
                            : "bg-white dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 active:scale-[0.98]",
                        )}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getMateriaColor(materia) }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-tight truncate flex-1 font-mono text-zinc-700 dark:text-zinc-300">
                          {materia.toLowerCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-2.5 lg:px-8 lg:py-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
          <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            {monthlyEvents.length} lezioni
          </span>
        </div>
        {isFetching && (
          <div className="w-3 h-3 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-500 dark:border-t-zinc-400 rounded-full animate-spin" />
        )}
      </div>
    </motion.div>
  );
}

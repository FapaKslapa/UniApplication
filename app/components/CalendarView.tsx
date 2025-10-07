import { useState } from "react";
import type { DaySchedule, ParsedEvent } from "@/lib/orario-utils";
import { getMateriaColorMap } from "@/lib/orario-utils";
import { CalendarDayDialog } from "@/app/components/CalendarDayDialog";

interface CalendarViewProps {
  schedule: DaySchedule[];
}

export function CalendarView({ schedule }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);

  const allMaterie = schedule.flatMap((day) => day.events.map((ev) => ev.materia));
  const materiaColorMap = getMateriaColorMap(allMaterie);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const dayData = schedule.find((s) => s.day === index);
    return {
      day: index,
      events: dayData?.events || [],
      hasEvents: (dayData?.events.length || 0) > 0,
    };
  });

  const getEventDots = (events: ParsedEvent[]) => {
    const materieSet = new Set(events.map((event) => event.materia));
    return Array.from(materieSet).slice(0, 3); // Max 3 dots per giorno
  };

  const getMateriaColor = (materia: string) => {
    const normalizedMateria = materia
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    return materiaColorMap[normalizedMateria] || "#666666";
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  const weekDayHeaders = [
    { label: "L", name: "Lunedì" },
    { label: "M", name: "Martedì" },
    { label: "M", name: "Mercoledì" },
    { label: "G", name: "Giovedì" },
    { label: "V", name: "Venerdì" },
    { label: "S", name: "Sabato" },
    { label: "D", name: "Domenica" },
  ];

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-black text-white">
        <div className="p-6 text-center border-b border-gray-800">
          <h1 className="text-xl font-light tracking-wide mb-1 font-serif">
            Orario
          </h1>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {weekDayHeaders.map((day) => (
              <div key={day.name} className="text-center py-3">
                <span className="text-xs font-mono text-white">
                  {day.label}
                </span>
              </div>
            ))}

            {weekDays.map((dayData, index) => {
              const dayNumber = index + 1; // Simuliamo i giorni 1-7 del mese
              const isToday = index === todayIndex;

              return (
                <button
                  key={dayData.day}
                  type="button"
                  onClick={() =>
                    dayData.hasEvents &&
                    setSelectedDay({ day: dayData.day, events: dayData.events })
                  }
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-lg
                    transition-all duration-200 active:scale-95
                    ${
                      dayData.hasEvents
                        ? "bg-gray-900 hover:bg-gray-800 cursor-pointer"
                        : "cursor-default"
                    }
                    ${isToday ? "ring-1 ring-white ring-opacity-30" : ""}
                  `}
                >
                  <span
                    className={`text-sm font-mono mb-1 ${
                      dayData.hasEvents ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {dayData.hasEvents && (
                    <div className="flex gap-0.5 justify-center">
                      {getEventDots(dayData.events).map((materia) => (
                        <div
                          key={materia}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getMateriaColor(materia) }}
                        />
                      ))}
                      {dayData.events.length > 3 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-6">
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-white mb-3">Materie</h3>
            {Array.from(
              new Set(schedule.flatMap((s) => s.events.map((e) => e.materia))),
            ).map((materia) => (
              <div key={materia} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getMateriaColor(materia) }}
                />
                <span className="text-xs text-white font-mono truncate">
                  {materia.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDay && (
        <CalendarDayDialog
          day={selectedDay}
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}

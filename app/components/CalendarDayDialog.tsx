import type { DaySchedule, ParsedEvent } from "@/lib/orario-utils";
import { getDayName } from "@/lib/orario-utils";

interface CalendarDayDialogProps {
  day: DaySchedule;
  isOpen: boolean;
  onClose: () => void;
  materiaColorMap: Record<string, string>;
}

export function CalendarDayDialog({
  day,
  isOpen,
  onClose,
  materiaColorMap,
}: CalendarDayDialogProps) {
  if (!isOpen) return null;

  const getMateriaColor = (materia: string) => {
    const normalizedMateria = materia
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    return materiaColorMap[normalizedMateria] || "#666666";
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Altezza di un'ora in pixel
  const HOUR_HEIGHT = 80;
  const START_HOUR = 8;

  // Calcola posizione e altezza per ogni evento
  const getEventPosition = (event: ParsedEvent) => {
    if (!event.time.includes(" - ")) {
      return { top: 0, height: HOUR_HEIGHT };
    }

    const [startTime, endTime] = event.time.split(" - ");
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const duration = endMinutes - startMinutes;

    const startHour = Math.floor(startMinutes / 60);
    const startMinuteOffset = startMinutes % 60;

    const top =
      (startHour - START_HOUR) * HOUR_HEIGHT +
      (startMinuteOffset / 60) * HOUR_HEIGHT;
    const height = (duration / 60) * HOUR_HEIGHT;

    return { top, height };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="w-full h-full mx-0 bg-black border border-gray-800 rounded-none overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 text-center relative">
          <h2 className="text-lg font-medium text-white font-serif">
            {getDayName(day.day)}
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1">
            {day.events.length}{" "}
            {day.events.length === 1 ? "lezione" : "lezioni"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Chiudi</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            <div className="flex">
              {/* Colonna degli orari */}
              <div className="w-16 flex-shrink-0">
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="text-right pr-3 text-xs font-mono text-gray-400"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  >
                    {slot}
                  </div>
                ))}
              </div>

              {/* Colonna degli eventi */}
              <div className="flex-1 relative border-l border-gray-800">
                {/* Linee orarie di sfondo */}
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot}
                    className="absolute w-full border-b border-gray-800 border-opacity-30"
                    style={{
                      top: `${index * HOUR_HEIGHT}px`,
                      height: `${HOUR_HEIGHT}px`,
                    }}
                  />
                ))}

                {/* Eventi posizionati in modo assoluto */}
                {day.events.map((event, eventIndex) => {
                  const { top, height } = getEventPosition(event);
                  const color = getMateriaColor(event.materia);

                  return (
                    <div
                      key={eventIndex}
                      className="absolute w-full px-2"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                    >
                      <div
                        className="h-full rounded-lg p-3 text-xs overflow-hidden"
                        style={{
                          backgroundColor: `${color}15`,
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <div className="font-medium text-white mb-2 text-sm leading-relaxed">
                          {event.materia}
                        </div>
                        <div className="text-gray-400 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-3 h-3 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>Orario</title>
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-mono text-xs">
                              {event.time}
                            </span>
                          </div>
                          {event.aula && (
                            <div className="flex items-start gap-2">
                              <svg
                                className="w-3 h-3 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <title>Aula</title>
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="leading-relaxed text-xs">
                                {event.aula}
                              </span>
                            </div>
                          )}
                          {event.docente && (
                            <div className="flex items-start gap-2">
                              <svg
                                className="w-3 h-3 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <title>Docente</title>
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="leading-relaxed text-xs">
                                {event.docente}
                              </span>
                            </div>
                          )}
                          <div className="pt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                                event.tipo === "Laboratorio"
                                  ? "bg-orange-500 bg-opacity-20 text-orange-300"
                                  : "bg-blue-500 bg-opacity-20 text-blue-300"
                              }`}
                            >
                              {event.tipo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            Tocca per chiudere
          </button>
        </div>
      </div>
    </div>
  );
}

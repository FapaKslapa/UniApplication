import type { DaySchedule, ParsedEvent } from '@/lib/orario-utils';
import { getDayName } from '@/lib/orario-utils';

interface CalendarDayDialogProps {
  day: DaySchedule;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarDayDialog({ day, isOpen, onClose }: CalendarDayDialogProps) {
  if (!isOpen) return null;

  const getMateriaColor = (materia: string) => {
    const colors: Record<string, string> = {
      'BASI DI DATI': '#00D4FF',
      'PROBABILITA E STATISTICA PER L\'INFORMATICA': '#FF3366',
      'SISTEMI OPERATIVI': '#00FF88',
      'PROGETTAZIONE DEL SOFTWARE': '#FFAA00',
    };

    const normalizedMateria = materia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    return colors[normalizedMateria] || colors[materia] || '#666666';
  };

  // Genera timeline oraria dalle 8:00 alle 20:00
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Funzione per convertire tempo in minuti per calcoli
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Funzione per controllare se un evento è attivo in un determinato slot
  const getEventForTimeSlot = (slotTime: string): ParsedEvent | null => {
    return day.events.find(event => {
      if (!event.time.includes(' - ')) return false;

      const [startTime, endTime] = event.time.split(' - ');
      const slotMinutes = timeToMinutes(slotTime);
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    }) || null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-black border border-gray-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-light text-white tracking-wide">
              {getDayName(day.day)}
            </h2>
            <p className="text-xs text-gray-400 font-mono">
              {day.events.length} {day.events.length === 1 ? 'lezione' : 'lezioni'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>Chiudi</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Timeline */}
        <div className="max-h-96 overflow-y-auto">
          <div className="relative">
            {timeSlots.map((slot) => {
              const event = getEventForTimeSlot(slot);
              const isHour = slot.endsWith(':00');

              return (
                <div key={slot} className="relative">
                  {/* Time label */}
                  <div className="flex">
                    <div className="w-12 py-3 px-2 text-right">
                      <span className={`text-xs font-mono ${isHour ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isHour ? slot : ''}
                      </span>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 relative border-l border-gray-800">
                      <div className={`py-3 px-3 relative ${event ? '' : 'min-h-[24px]'}`}>
                        {event && (
                          <div
                            className="rounded-lg p-4 text-xs"
                            style={{
                              backgroundColor: `${getMateriaColor(event.materia)}15`,
                              borderLeft: `3px solid ${getMateriaColor(event.materia)}`
                            }}
                          >
                            <div className="font-medium text-white mb-3 text-sm leading-relaxed">
                              {event.materia}
                            </div>
                            <div className="text-gray-400 space-y-2">
                              <div className="flex items-center gap-2">
                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <title>Orario</title>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="font-mono">{event.time}</span>
                              </div>
                              {event.aula && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <title>Aula</title>
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="leading-relaxed">{event.aula}</span>
                                </div>
                              )}
                              {event.docente && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <title>Docente</title>
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                  <span className="leading-relaxed">{event.docente}</span>
                                </div>
                              )}
                              <div className="pt-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                                  event.tipo === 'Laboratorio' 
                                    ? 'bg-orange-500 bg-opacity-20 text-orange-300' 
                                    : 'bg-blue-500 bg-opacity-20 text-blue-300'
                                }`}>
                                  {event.tipo}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
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
import type { ParsedEvent } from '@/lib/orario-utils';
import { getMateriaColor } from '@/lib/orario-utils';

interface OrarioCardProps {
  event: ParsedEvent;
}

export function OrarioCard({ event }: OrarioCardProps) {
  const accentColor = getMateriaColor(event.materia);

  return (
    <div className="bg-nothing-black border-2 border-nothing-gray-900 rounded-nothing-lg overflow-hidden hover:border-nothing-gray-700 nothing-transition">
      {/* LED strip indicator */}
      <div className="h-1 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}`
          }}
        />
      </div>

      <div className="p-4">
        {/* Orario - Digital display style */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-nothing-gray-800 rounded-nothing flex items-center justify-center">
              <svg className="w-4 h-4 text-nothing-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <title>Orario</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-base font-dotgothic text-nothing-white tracking-wider">{event.time}</span>
          </div>

          {/* Badge tipo - LED style */}
          <span className={`ml-auto text-xs px-3 py-1.5 font-dotgothic tracking-wider uppercase border ${
            event.tipo === 'Laboratorio' 
              ? 'bg-nothing-accent-orange bg-opacity-10 text-nothing-accent-orange border-nothing-accent-orange border-opacity-30' 
              : 'bg-nothing-accent-cyan bg-opacity-10 text-nothing-accent-cyan border-nothing-accent-cyan border-opacity-30'
          }`}>
            {event.tipo}
          </span>
        </div>

        {/* Materia - Pixel display */}
        <div className="mb-4 p-3 border border-nothing-gray-900 rounded-nothing bg-nothing-gray-900 bg-opacity-20">
          <div className="flex items-start gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 6px ${accentColor}`
              }}
            />
            <h3 className="font-dotgothic text-nothing-white text-sm uppercase tracking-wide leading-relaxed">
              {event.materia}
            </h3>
          </div>
        </div>

        {/* Info aggiuntive - Modular blocks */}
        <div className="space-y-2 text-xs text-nothing-gray-400">
          {event.aula && (
            <div className="flex items-center gap-2 p-2 border border-nothing-gray-900 rounded bg-nothing-gray-900 bg-opacity-10">
              <div className="w-6 h-6 border border-nothing-gray-800 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-nothing-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <title>Aula</title>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-dotgothic tracking-wide uppercase">{event.aula}</span>
            </div>
          )}

          {event.docente && (
            <div className="flex items-center gap-2 p-2 border border-nothing-gray-900 rounded bg-nothing-gray-900 bg-opacity-10">
              <div className="w-6 h-6 border border-nothing-gray-800 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-nothing-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <title>Docente</title>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-dotgothic tracking-wide uppercase">{event.docente}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

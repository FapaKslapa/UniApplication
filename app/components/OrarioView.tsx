"use client";

import type { DaySchedule, ParsedEvent } from '@/lib/orario-utils';
import { useState } from 'react';
import { Clock, MapPin, User, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface OrarioViewProps {
  schedule: DaySchedule[];
}

const getDayName = (dayIndex: number): string => {
  const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  return giorni[dayIndex] || `Giorno ${dayIndex}`;
};

const getMateriaColorDot = (materia: string) => {
  const colors: Record<string, string> = {
    'BASI DI DATI': '#00D4FF',
    'PROBABILITA E STATISTICA PER L\'INFORMATICA': '#FF3366',
    'SISTEMI OPERATIVI': '#00FF88',
    'PROGETTAZIONE DEL SOFTWARE': '#FFAA00',
  };

  const normalizedMateria = materia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  return colors[normalizedMateria] || colors[materia] || '#666666';
};

export function OrarioView({ schedule }: OrarioViewProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Filtra solo i giorni con eventi
  const daysWithEvents = schedule.filter(day => day.events.length > 0);

  if (daysWithEvents.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto bg-black border border-gray-900 rounded-2xl overflow-hidden">
        <div className="p-6 text-center border-b border-gray-900">
          <h1 className="text-xl font-light tracking-wide mb-1">Orario</h1>
          <p className="text-xs text-gray-500 font-mono">Settimana corrente</p>
        </div>
        
        <div className="p-8 text-center">
          <div className="w-12 h-12 border border-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-5 h-5 text-gray-800" />
          </div>
          <p className="text-xs text-gray-600 font-mono">nessuna lezione programmata</p>
        </div>
      </div>
    );
  }

  const currentDay = daysWithEvents[currentDayIndex];
  const currentLesson = currentDay.events[currentLessonIndex];
  const dotColor = getMateriaColorDot(currentLesson.materia);

  return (
    <div className="w-full max-w-md mx-auto bg-black border border-gray-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 text-center border-b border-gray-900">
        <h1 className="text-xl font-light tracking-wide mb-1">Orario</h1>
        <p className="text-xs text-gray-500 font-mono">Settimana corrente</p>
      </div>

      {/* Day navigation */}
      <div className="p-4 border-b border-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-white font-mono">{getDayName(currentDay.day)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setCurrentDayIndex(Math.max(currentDayIndex - 1, 0));
                setCurrentLessonIndex(0);
              }}
              disabled={currentDayIndex === 0}
              className="w-7 h-7 border border-gray-800 rounded-md flex items-center justify-center hover:border-gray-700 disabled:opacity-30 transition-colors"
              type="button"
            >
              <ChevronLeft className="w-3 h-3 text-gray-500" />
            </button>
            <span className="text-xs text-gray-600 font-mono px-2 min-w-12 text-center">
              {currentDayIndex + 1} / {daysWithEvents.length}
            </span>
            <button
              onClick={() => {
                setCurrentDayIndex(Math.min(currentDayIndex + 1, daysWithEvents.length - 1));
                setCurrentLessonIndex(0);
              }}
              disabled={currentDayIndex === daysWithEvents.length - 1}
              className="w-7 h-7 border border-gray-800 rounded-md flex items-center justify-center hover:border-gray-700 disabled:opacity-30 transition-colors"
              type="button"
            >
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Lesson content */}
      <div className="p-6">
        {/* Time and dot */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-lg text-white font-mono">{currentLesson.time}</span>
          </div>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </div>

        {/* Subject */}
        <h3 className="text-white text-base font-light mb-4 leading-tight">
          {currentLesson.materia.toLowerCase()}
        </h3>

        {/* Details */}
        <div className="space-y-3">
          {currentLesson.aula && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-500 font-mono">{currentLesson.aula.toLowerCase()}</span>
            </div>
          )}

          {currentLesson.docente && (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-500 font-mono">{currentLesson.docente.toLowerCase()}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-gray-700 rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-500 font-mono">{currentLesson.tipo.toLowerCase()}</span>
          </div>
        </div>

        {/* Lesson navigation */}
        {currentDay.events.length > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-mono">
                lezione {currentLessonIndex + 1} / {currentDay.events.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentLessonIndex(Math.max(currentLessonIndex - 1, 0))}
                  disabled={currentLessonIndex === 0}
                  className="w-6 h-6 border border-gray-800 rounded-sm flex items-center justify-center hover:border-gray-700 disabled:opacity-30 transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-2.5 h-2.5 text-gray-500" />
                </button>
                <button
                  onClick={() => setCurrentLessonIndex(Math.min(currentLessonIndex + 1, currentDay.events.length - 1))}
                  disabled={currentLessonIndex === currentDay.events.length - 1}
                  className="w-6 h-6 border border-gray-800 rounded-sm flex items-center justify-center hover:border-gray-700 disabled:opacity-30 transition-colors"
                  type="button"
                >
                  <ChevronRight className="w-2.5 h-2.5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day dots indicator */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center gap-1.5">
          {daysWithEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentDayIndex(index);
                setCurrentLessonIndex(0);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentDayIndex 
                  ? 'bg-white w-4' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

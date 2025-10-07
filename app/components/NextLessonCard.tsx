"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dot,
  MapPin,
  User,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import type { DaySchedule } from "@/lib/orario-utils";
import { getMateriaColorMap } from "@/lib/orario-utils";

const parseEventTitle = (title: string) => {
  const aulaMatch = title.match(/^(.+?)Aula/);
  const materia = aulaMatch ? aulaMatch[1].trim() : title;

  const aulaFullMatch = title.match(/Aula\s+(.+?)\s+([A-Z]\.\s*[A-Z]+)/);
  const aula = aulaFullMatch ? `Aula ${aulaFullMatch[1].trim()}` : "";
  let docente = aulaFullMatch ? aulaFullMatch[2].trim() : "";

  // Rimuovi eventuali "L" finali aggiunte erroneamente
  if (docente && docente.endsWith("L")) {
    docente = docente.slice(0, -1);
  }

  const tipo = title.includes("Laboratorio") ? "Laboratorio" : "Lezione";

  return { materia, aula, docente, tipo };
};

export default function NextLessonCard({
  schedule,
}: {
  schedule: DaySchedule[];
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const { data, isLoading, error } = api.orario.getNextLesson.useQuery({
    dayOffset,
  });
  console.log("Data:", data);
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto bg-black border border-gray-900 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-white rounded w-16"></div>
              <div className="h-3 bg-white rounded w-8"></div>
            </div>
            <div className="h-4 bg-white rounded w-24"></div>
            <div className="h-6 bg-white rounded w-full"></div>
            <div className="space-y-2">
              <div className="h-3 bg-white rounded w-3/4"></div>
              <div className="h-3 bg-white rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-black border border-red-500 rounded-2xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-8 h-8 border border-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Dot className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xs text-red-500 font-mono">errore caricamento</p>
        </div>
      </div>
    );
  }

  const lessons = data?.lessons || [];
  const allMaterie = lessons.map(
    (lesson) => parseEventTitle(lesson.title).materia,
  );
  const materiaColorMap = getMateriaColorMap(allMaterie);

  const getMateriaColorDot = (materia: string) => {
    const normalizedMateria = materia
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    return materiaColorMap[normalizedMateria] || "#666666";
  };

  const hasLessons = data?.hasLessons && lessons.length > 0;

  if (!hasLessons) {
    return (
      <div className="w-full max-w-md mx-auto bg-black border border-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-mono">
                {data?.dayName || "Giorno"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDayOffset(Math.max(dayOffset - 1, 0))}
                disabled={dayOffset === 0}
                className="w-7 h-7 border border-white rounded-md flex items-center justify-center hover:border-white disabled:opacity-30 transition-colors"
                type="button"
              >
                <ChevronLeft className="w-3 h-3 text-white" />
              </button>
              <span className="text-xs text-white font-mono px-2 min-w-12 text-center">
                {dayOffset === 0 ? "oggi" : `+${dayOffset}`}
              </span>
              <button
                onClick={() => setDayOffset(dayOffset + 1)}
                className="w-7 h-7 border border-white rounded-md flex items-center justify-center hover:border-white disabled:opacity-30 transition-colors"
                type="button"
              >
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 border border-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-4 h-4 border border-white rounded-sm"></div>
          </div>
          <p className="text-xs text-white font-mono">nessuna lezione</p>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[currentLessonIndex];
  const parsedLesson = parseEventTitle(currentLesson.title);
  const dotColor = getMateriaColorDot(parsedLesson.materia);

  const isCurrentLesson =
    data.nextLesson?.status === "current" &&
    data.nextLesson.lesson.time === currentLesson.time;
  const isNextLesson =
    data.nextLesson?.status === "next" &&
    data.nextLesson.lesson.time === currentLesson.time;

  return (
    <div className="w-full max-w-md mx-auto bg-black border border-gray-900 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-mono">{data.dayName}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setDayOffset(Math.max(dayOffset - 1, 0));
                setCurrentLessonIndex(0);
              }}
              disabled={dayOffset === 0}
              className="w-7 h-7 border border-white rounded-md flex items-center justify-center hover:border-white disabled:opacity-30 transition-colors"
              type="button"
            >
              <ChevronLeft className="w-3 h-3 text-white" />
            </button>
            <span className="text-xs text-white font-mono px-2 min-w-12 text-center">
              {dayOffset === 0 ? "oggi" : `+${dayOffset}`}
            </span>
            <button
              onClick={() => {
                setDayOffset(dayOffset + 1);
                setCurrentLessonIndex(0);
              }}
              className="w-7 h-7 border border-white rounded-md flex items-center justify-center hover:border-white disabled:opacity-30 transition-colors"
              type="button"
            >
              <ChevronRight className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {(isCurrentLesson || isNextLesson) && (
          <div className="mb-4">
            <div
              className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-mono ${
                isCurrentLesson
                  ? "text-green-400 bg-green-500 bg-opacity-10 border border-green-900"
                  : "text-blue-400 bg-blue-500 bg-opacity-10 border border-blue-900"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrentLesson ? "bg-green-400" : "bg-blue-400"
                }`}
              ></div>
              {isCurrentLesson ? "in corso" : "prossima"}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-lg text-white font-mono">
              {currentLesson.time}
            </span>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </div>
        <h3 className="text-white text-base font-light mb-4 leading-tight font-serif">
          {parsedLesson.materia.toLowerCase()}
        </h3>
        <div className="space-y-3">
          {parsedLesson.aula && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-mono">
                {parsedLesson.aula.toLowerCase()}
              </span>
            </div>
          )}
          {parsedLesson.docente && (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-mono">
                {parsedLesson.docente.toLowerCase()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-white rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span className="text-xs text-white font-mono">
              {parsedLesson.tipo.toLowerCase()}
            </span>
          </div>
        </div>
        {lessons.length > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-mono">
                {currentLessonIndex + 1} / {lessons.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentLessonIndex(Math.max(currentLessonIndex - 1, 0))
                  }
                  disabled={currentLessonIndex === 0}
                  className="w-6 h-6 border border-white rounded-sm flex items-center justify-center hover:border-white disabled:opacity-30 transition-colors"
                  type="button"
                >
                  <ChevronLeft className="w-2.5 h-2.5 text-white" />
                </button>
                <button
                  onClick={() =>
                    setCurrentLessonIndex(
                      Math.min(currentLessonIndex + 1, lessons.length - 1),
                    )
                  }
                  disabled={currentLessonIndex === lessons.length - 1}
                  className="w-6 h-6 border border-white rounded-sm flex items-center justify-center hover:border-white disabled:opacity-30 transition-colors"
                  type="button"
                >
                  <ChevronRight className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

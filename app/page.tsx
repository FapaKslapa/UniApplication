"use client";

import { api } from "@/lib/api";
import { parseOrarioData } from "@/lib/orario-utils";
import { CalendarView } from "./components/CalendarView";
import NextLessonCard from "./components/NextLessonCard";

export default function Home() {
  const {
    data: orario,
    isLoading,
    error,
  } = api.orario.getOrario.useQuery({ name: "test" });

  const schedule = orario ? parseOrarioData(orario) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono text-sm">
            Caricamento orario...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Errore</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-400 font-mono text-sm mb-2">
            Errore nel caricamento
          </p>
          <p className="text-gray-500 text-xs">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Contenuto principale */}
      <main className="w-full px-4 py-4 space-y-6 flex-1">
        <h1 className="text-lg font-semibold mb-4 text-white font-serif">
          Orario Insubria
        </h1>
        <section>
          <NextLessonCard schedule={schedule} />
        </section>

        {/* Sezione Calendario */}
        <section>
          <CalendarView schedule={schedule} />
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 border-t border-gray-900">
        <p className="text-gray-400 text-sm">
          powered by{" "}
          <a
            href="https://stackhorizon.it"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            StackHorizon
          </a>
        </p>
      </footer>
    </div>
  );
}

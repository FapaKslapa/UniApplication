"use client";

import { useState } from "react";
import { ExamMessage } from "@/components/exams/ExamMessage";
import { ExamMonthList } from "@/components/exams/ExamMonthList";
import { ExamSearchInput } from "@/components/exams/ExamSearchInput";
import { ExamSkeleton } from "@/components/exams/ExamSkeleton";
import { useExamSearch } from "@/components/exams/useExamSearch";
import { useNow } from "@/components/exams/useNow";
import { Button } from "@/components/ui/button";

export function ExamCalendarTab() {
  const [query, setQuery] = useState("");
  const search = useExamSearch(query);
  const now = useNow();
  const searching = search.term.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ExamSearchInput value={query} onChange={setQuery} />
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
        {search.isLoading ? (
          <ExamSkeleton />
        ) : search.isError ? (
          <ExamMessage
            title="Non riesco a caricare gli esami"
            hint="Controlla la connessione e riprova."
          >
            <Button
              variant="outline"
              onClick={() => search.refetch()}
              className="min-h-11 rounded-full"
            >
              Riprova
            </Button>
          </ExamMessage>
        ) : search.items.length === 0 ? (
          searching ? (
            <ExamMessage
              title={`Nessun esame trovato per «${search.term}»`}
              hint="Prova con meno parole o con il solo nome della materia."
            />
          ) : (
            <ExamMessage
              title="Nessun esame in calendario"
              hint="Gli appelli compaiono quando vengono pubblicati. Controlla più tardi."
            />
          )
        ) : (
          <>
            <ExamMonthList exams={search.items} now={now} />
            {search.hasNextPage && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  disabled={search.isFetchingNextPage}
                  onClick={() => search.fetchNextPage()}
                  className="min-h-11 rounded-full px-6"
                >
                  {search.isFetchingNextPage ? "Caricamento…" : "Carica altri"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

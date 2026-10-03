"use client";

import { ExamCard } from "@/components/exams/ExamCard";
import { ExamMessage } from "@/components/exams/ExamMessage";
import { ExamSkeleton } from "@/components/exams/ExamSkeleton";
import { upcomingMilestones } from "@/components/exams/examFormat";
import { NotificationsHint } from "@/components/exams/NotificationsHint";
import { useNow } from "@/components/exams/useNow";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type MyExamsTabProps = {
  onGoToCalendar: () => void;
};

export function MyExamsTab({ onGoToCalendar }: MyExamsTabProps) {
  const now = useNow();
  const { data, isLoading, isError, refetch } = api.exams.followed.useQuery(
    undefined,
    {
      refetchOnMount: "always",
    },
  );

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4">
      {isLoading ? (
        <ExamSkeleton />
      ) : isError ? (
        <ExamMessage
          title="Non riesco a caricare i tuoi esami"
          hint="Controlla la connessione e riprova."
        >
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="min-h-11 rounded-full"
          >
            Riprova
          </Button>
        </ExamMessage>
      ) : !data || data.length === 0 ? (
        <ExamMessage
          title="Non segui nessun esame"
          hint="Vai su Calendario e tocca Segui: lo vedrai anche nell'agenda e riceverai un promemoria."
        >
          <Button
            onClick={onGoToCalendar}
            className="min-h-11 rounded-full px-5"
          >
            Vai al Calendario
          </Button>
        </ExamMessage>
      ) : (
        <>
          <NotificationsHint />
          <div className="space-y-1.5 xl:grid xl:grid-cols-2 xl:gap-1.5 xl:space-y-0">
            {data.map((exam, index) => {
              const milestones = upcomingMilestones(exam, now);
              return (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  now={now}
                  emphasized={index === 0}
                >
                  {milestones.length > 0 && (
                    <ul className="space-y-0.5 border-t border-border pt-2">
                      {milestones.map((milestone) => (
                        <li
                          key={milestone.key}
                          className="text-xs text-muted-foreground"
                        >
                          {milestone.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </ExamCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

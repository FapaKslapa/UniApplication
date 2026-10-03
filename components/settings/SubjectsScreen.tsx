import { m } from "framer-motion";
import { SkeletonList } from "@/components/LoadingScreen";
import { EmptyNote } from "@/components/settings/EmptyNote";
import { SubjectRow } from "@/components/settings/SubjectRow";
import type { SubjectVisibility } from "@/components/settings/useSubjectVisibility";
import { Badge } from "@/components/ui/badge";
import { fadeUpVariants } from "@/lib/motion";

type SubjectsScreenProps = { visibility: SubjectVisibility };

export function SubjectsScreen({ visibility }: SubjectsScreenProps) {
  const { subjects, isLoading, hiddenSubjects, toggleSubject, visibleCount } =
    visibility;
  const hasSubjects = !!subjects && subjects.length > 0;
  const hiddenSet = new Set(hiddenSubjects);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isLoading && hasSubjects && (
        <div className="flex shrink-0 justify-end px-4 pt-4 pb-3">
          <Badge variant="secondary">
            {visibleCount}/{subjects.length}
          </Badge>
        </div>
      )}
      <div className="flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-4">
        {isLoading && <SkeletonList rows={5} />}
        {!isLoading && !hasSubjects && (
          <EmptyNote hint="Controlla di aver scelto il corso giusto in «I miei corsi».">
            Nessuna lezione nei prossimi 6 mesi
          </EmptyNote>
        )}
        {hasSubjects &&
          subjects.map((subject, index) => (
            <m.div
              key={subject}
              custom={index}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <SubjectRow
                subject={subject}
                hidden={hiddenSet.has(subject)}
                onToggle={() => toggleSubject(subject)}
              />
            </m.div>
          ))}
      </div>
    </div>
  );
}

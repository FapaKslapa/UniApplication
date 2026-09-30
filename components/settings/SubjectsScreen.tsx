import { SkeletonList } from "@/components/LoadingScreen";
import { EmptyNote } from "@/components/settings/EmptyNote";
import { SubjectRow } from "@/components/settings/SubjectRow";
import type { SubjectVisibility } from "@/components/settings/useSubjectVisibility";
import { Badge } from "@/components/ui/badge";

type SubjectsScreenProps = { visibility: SubjectVisibility };

export function SubjectsScreen({ visibility }: SubjectsScreenProps) {
  const { subjects, isLoading, hiddenSubjects, toggleSubject, visibleCount } =
    visibility;
  const hasSubjects = !!subjects && subjects.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 pb-3">
        <p className="text-xs text-muted-foreground">
          Deseleziona le materie che non vuoi vedere nell'orario.
        </p>
        {!isLoading && hasSubjects && (
          <Badge variant="secondary">
            {visibleCount}/{subjects.length}
          </Badge>
        )}
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-4">
        {isLoading && <SkeletonList rows={5} />}
        {!isLoading && !hasSubjects && (
          <EmptyNote>Nessuna materia trovata per i prossimi 6 mesi.</EmptyNote>
        )}
        {hasSubjects &&
          subjects.map((subject) => (
            <SubjectRow
              key={subject}
              subject={subject}
              hidden={hiddenSubjects.includes(subject)}
              onToggle={() => toggleSubject(subject)}
            />
          ))}
      </div>
    </div>
  );
}

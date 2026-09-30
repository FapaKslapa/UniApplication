"use client";

import { useState } from "react";
import { SkeletonList } from "@/components/LoadingScreen";
import { EmptyNote } from "@/components/settings/EmptyNote";
import { SearchInput } from "@/components/settings/SearchInput";
import { SelectRow } from "@/components/settings/SelectRow";
import type { CourseDraft } from "@/components/settings/useCourseDraft";

type ProfessorListProps = { draft: CourseDraft };

export function ProfessorList({ draft }: ProfessorListProps) {
  const [query, setQuery] = useState("");
  const normalized = query.toLowerCase();
  const professors = draft.professors.filter((name) =>
    name.toLowerCase().includes(normalized),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-3 px-4 pb-2">
        <p className="text-xs text-muted-foreground">
          Cerca il tuo nome nell'elenco dei docenti per caricare il tuo orario
          personale.
        </p>
        <SearchInput
          value={query}
          placeholder="Cerca il tuo nome..."
          onChange={setQuery}
        />
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 pb-4">
        {draft.isLoadingProfessors && <SkeletonList rows={5} />}
        {!draft.isLoadingProfessors && professors.length === 0 && (
          <EmptyNote>Nessun docente trovato.</EmptyNote>
        )}
        {!draft.isLoadingProfessors &&
          professors.map((name) => (
            <SelectRow
              key={name}
              selected={draft.professorName === name}
              shape="radio"
              onSelect={() => draft.setProfessorName(name)}
              title={name}
            />
          ))}
      </div>
    </div>
  );
}

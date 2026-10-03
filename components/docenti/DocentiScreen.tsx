"use client";

import { Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { FavoriteProfessorRow } from "@/components/docenti/FavoriteProfessorRow";
import { ProfessorRow } from "@/components/docenti/ProfessorRow";
import { ProfessorRowSkeleton } from "@/components/docenti/ProfessorRowSkeleton";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

type DocentiScreenProps = {
  onOpenProfessor: (name: string) => void;
};

export function DocentiScreen({ onOpenProfessor }: DocentiScreenProps) {
  const [query, setQuery] = useState("");
  const { favoriteProfessors, recentProfessors, toggleFavoriteProfessor } =
    useAppStore();
  const { data: allProfessors, isLoading } = api.orario.getProfessors.useQuery(
    {},
  );

  const results = useMemo(() => {
    if (!allProfessors || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allProfessors.filter((name) => name.toLowerCase().includes(q));
  }, [allProfessors, query]);

  const isFavorite = (name: string) => favoriteProfessors.includes(name);
  const isSearching = query.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 px-1">
      <h1 className="px-3 pt-1 text-lg font-bold leading-none">Docenti</h1>

      <div className="relative shrink-0 px-3">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca un docente per cognome…"
          aria-label="Cerca un docente"
          className="h-11 rounded-full pl-10"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {isSearching ? (
          <section className="space-y-1.5 xl:grid xl:grid-cols-2 xl:gap-1.5 xl:space-y-0">
            {results.length === 0 && (
              <div className="space-y-1 px-2 py-8 xl:col-span-2">
                <p className="text-xl font-bold leading-tight tracking-tight">
                  Nessun docente trovato.
                </p>
                <p className="text-sm text-muted-foreground">
                  Prova con il solo cognome di «{query.trim()}» o controlla come
                  l'hai scritto.
                </p>
              </div>
            )}
            {results.map((name) => (
              <ProfessorRow
                key={name}
                name={name}
                isFavorite={isFavorite(name)}
                onOpen={() => onOpenProfessor(name)}
                onToggleFavorite={() => toggleFavoriteProfessor(name)}
              />
            ))}
          </section>
        ) : (
          <>
            {favoriteProfessors.length > 0 && (
              <section className="space-y-1.5">
                <h2 className="px-1 text-xs font-semibold text-muted-foreground">
                  Preferiti
                </h2>
                <div className="space-y-1.5 xl:grid xl:grid-cols-2 xl:gap-1.5 xl:space-y-0">
                  {favoriteProfessors.map((name) => (
                    <FavoriteProfessorRow
                      key={name}
                      name={name}
                      onOpen={() => onOpenProfessor(name)}
                      onToggleFavorite={() => toggleFavoriteProfessor(name)}
                    />
                  ))}
                </div>
              </section>
            )}

            {recentProfessors.length > 0 && (
              <section className="space-y-1.5">
                <h2 className="px-1 text-xs font-semibold text-muted-foreground">
                  Recenti
                </h2>
                <div className="space-y-1.5 xl:grid xl:grid-cols-2 xl:gap-1.5 xl:space-y-0">
                  {recentProfessors
                    .filter((name) => !isFavorite(name))
                    .map((name) => (
                      <ProfessorRow
                        key={name}
                        name={name}
                        isFavorite={false}
                        onOpen={() => onOpenProfessor(name)}
                        onToggleFavorite={() => toggleFavoriteProfessor(name)}
                      />
                    ))}
                </div>
              </section>
            )}

            {favoriteProfessors.length === 0 &&
            recentProfessors.length === 0 &&
            isLoading ? (
              <ProfessorRowSkeleton />
            ) : (
              <div className="space-y-1 px-2 py-8">
                <p className="text-xl font-bold leading-tight tracking-tight">
                  Trova un docente.
                </p>
                <p className="text-sm text-muted-foreground">
                  Scrivi un nome per vedere dove tiene lezione, adesso o alla
                  prossima.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

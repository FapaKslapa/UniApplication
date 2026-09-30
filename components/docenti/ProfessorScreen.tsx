"use client";

import { ArrowLeft, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { Button } from "@/components/ui/button";
import { startOfDay } from "@/lib/agenda/dates";
import type { AgendaMode } from "@/lib/agenda/types";
import { api } from "@/lib/api";
import { getCurrentItalianDateTime } from "@/lib/date-utils";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type ProfessorScreenProps = {
  name: string;
  onBack: () => void;
};

export function ProfessorScreen({ name, onBack }: ProfessorScreenProps) {
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(getCurrentItalianDateTime()),
  );
  const [mode, setMode] = useState<AgendaMode>("day");
  const { favoriteProfessors, toggleFavoriteProfessor, addRecentProfessor } =
    useAppStore();
  const isFavorite = favoriteProfessors.includes(name);
  const utils = api.useUtils();

  useEffect(() => {
    addRecentProfessor(name);
  }, [name, addRecentProfessor]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center gap-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Indietro"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-lg font-bold leading-none">
          {name}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
          }
          onClick={() => toggleFavoriteProfessor(name)}
          className="rounded-full"
        >
          <Star
            className={cn(
              "size-4",
              isFavorite
                ? "fill-warning text-warning"
                : "text-muted-foreground",
            )}
          />
        </Button>
      </div>

      <AgendaScreen
        selectedDate={selectedDate}
        mode={mode}
        source={{ kind: "professor", name }}
        title="Dove si trova"
        onSelectedDateChange={setSelectedDate}
        onModeChange={setMode}
        onRefresh={() => utils.orario.getOrario.invalidate()}
      />
    </div>
  );
}

"use client";

import { ProfessorRow } from "@/components/docenti/ProfessorRow";
import { useProfessorStatus } from "@/components/docenti/useProfessorStatus";

type FavoriteProfessorRowProps = {
  name: string;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

export function FavoriteProfessorRow({
  name,
  onOpen,
  onToggleFavorite,
}: FavoriteProfessorRowProps) {
  const status = useProfessorStatus(name);

  return (
    <ProfessorRow
      name={name}
      status={status.label}
      statusTone={status.tone}
      isFavorite
      onOpen={onOpen}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

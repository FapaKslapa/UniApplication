"use client";

import { History } from "lucide-react";
import { useState } from "react";
import { ChangeHistoryDrawer } from "@/components/home/ChangeHistoryDrawer";
import { MenuRow } from "@/components/settings/MenuRow";

export function ChangeHistoryEntry() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MenuRow
        icon={History}
        title="Cosa è cambiato"
        subtitle="Cambi di orario degli ultimi 14 giorni"
        onClick={() => setOpen(true)}
      />
      <ChangeHistoryDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}

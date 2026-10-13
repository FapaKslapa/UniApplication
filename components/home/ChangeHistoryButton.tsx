"use client";

import { useState } from "react";
import { ChangeHistoryDrawer } from "@/components/home/ChangeHistoryDrawer";
import { Button } from "@/components/ui/button";

export function ChangeHistoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Apri
      </Button>
      <ChangeHistoryDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}

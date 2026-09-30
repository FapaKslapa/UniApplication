"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";
import { DocentiScreen } from "@/components/docenti/DocentiScreen";
import { ProfessorScreen } from "@/components/docenti/ProfessorScreen";

export function DocentiLayout() {
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(
    null,
  );

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col md:max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {selectedProfessor ? (
          <m.div
            key="professor"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.15 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ProfessorScreen
              name={selectedProfessor}
              onBack={() => setSelectedProfessor(null)}
            />
          </m.div>
        ) : (
          <m.div
            key="list"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.15 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DocentiScreen onOpenProfessor={setSelectedProfessor} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

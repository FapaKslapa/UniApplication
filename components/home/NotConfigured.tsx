"use client";

import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { NotConfiguredPreview } from "@/components/home/NotConfiguredPreview";
import { Button } from "@/components/ui/button";
import { fadeUpVariants } from "@/lib/motion";

type NotConfiguredProps = {
  onConfigure: () => void;
};

export function NotConfigured({ onConfigure }: NotConfiguredProps) {
  return (
    <m.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto p-6 text-center"
    >
      <NotConfiguredPreview />
      <div className="max-w-xs space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Scegli il tuo corso
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Indica il tuo corso di laurea e l'anno: vedrai solo le tue lezioni, e
          potrai cambiare scelta quando vuoi.
        </p>
      </div>
      <Button size="lg" onClick={onConfigure}>
        Scegli il corso
        <ArrowRight className="size-4" />
      </Button>
    </m.div>
  );
}

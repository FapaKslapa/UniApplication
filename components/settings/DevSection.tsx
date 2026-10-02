"use client";

import { AnimatePresence, m } from "framer-motion";
import { ChevronRight, Code2, ExternalLink, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { GitHubIcon } from "@/components/settings/GitHubIcon";
import { IconTile } from "@/components/settings/IconTile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { springs } from "@/lib/motion";

const REPO_URL = "https://github.com/FapaKslapa/UniApplication";

type DevSectionProps = {
  isAdmin: boolean;
  onAdmin: () => void;
  onLogoutAdmin: () => void;
};

export function DevSection({
  isAdmin,
  onAdmin,
  onLogoutAdmin,
}: DevSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <m.div layout className="overflow-hidden rounded-lg bg-card elevation-1">
      <Button
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        className="h-auto w-full justify-start gap-4 rounded-none px-4 py-3.5 text-left"
      >
        <IconTile icon={Code2} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            Opzioni sviluppatore
          </span>
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            GitHub · Admin
          </span>
        </span>
        <m.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="size-4 text-muted-foreground" />
        </m.span>
      </Button>

      <AnimatePresence initial={false} mode="popLayout">
        {open && (
          <m.div
            key="dev-section-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springs.gentle}
          >
            <Separator />
            <Button
              variant="ghost"
              onClick={() => window.open(REPO_URL, "_blank")}
              className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-left"
            >
              <IconTile icon={GitHubIcon} small />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">
                  Repository GitHub
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  FapaKslapa/UniApplication
                </span>
              </span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </Button>
            <Separator />
            <Button
              variant="ghost"
              onClick={isAdmin ? onLogoutAdmin : onAdmin}
              className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-left"
            >
              <IconTile
                icon={ShieldAlert}
                tone={isAdmin ? "destructive" : "neutral"}
                small
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">
                  {isAdmin ? "Logout admin" : "Pannello admin"}
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {isAdmin
                    ? "Disabilita privilegi amministrativi"
                    : "Gestione corsi e statistiche"}
                </span>
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Button>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

"use client";

import { CalendarDays, Filter, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { MonthTab } from "@/components/monthly-view/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MonthViewMenuProps = {
  activeTab: MonthTab;
  onSelectTab: (tab: MonthTab) => void;
};

export function MonthViewMenu({ activeTab, onSelectTab }: MonthViewMenuProps) {
  const [open, setOpen] = useState(false);

  const select = (tab: MonthTab) => {
    onSelectTab(tab);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Cambia vista">
          <MoreHorizontal className="size-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-40 rounded-md bg-popover p-1.5 elevation-2"
      >
        <div className="flex flex-col gap-1">
          <Button
            variant={activeTab === "calendar" ? "secondary" : "ghost"}
            className="justify-start gap-2 px-3 text-xs font-semibold"
            onClick={() => select("calendar")}
          >
            <CalendarDays className="size-4" />
            <span>Mese</span>
          </Button>
          <Button
            variant={activeTab === "filters" ? "secondary" : "ghost"}
            className="justify-start gap-2 px-3 text-xs font-semibold"
            onClick={() => select("filters")}
          >
            <Filter className="size-4" />
            <span>Filtri</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

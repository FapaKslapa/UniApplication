"use client";

import { useMemo } from "react";
import { ChangeHistoryList } from "@/components/home/ChangeHistoryList";
import {
  ChangeHistoryEmpty,
  ChangeHistoryError,
  ChangeHistorySkeleton,
} from "@/components/home/ChangeHistoryState";
import { groupHistoryByDay } from "@/components/home/changeHistoryGroups";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "@/lib/api";
import { useActiveLinkIds } from "@/lib/store";

type ChangeHistoryDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeHistoryDrawer({
  open,
  onOpenChange,
}: ChangeHistoryDrawerProps) {
  const linkIds = useActiveLinkIds();
  const hasCourses = linkIds.length > 0;
  const { data, isLoading, isError, refetch } =
    api.orario.getChangeHistory.useQuery(
      { linkIds, days: 14 },
      { enabled: open && hasCourses },
    );
  const groups = useMemo(() => groupHistoryByDay(data ?? []), [data]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-popover">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl">Cosa è cambiato</DrawerTitle>
          <DrawerDescription>
            Gli ultimi cambi alle tue lezioni, dal più recente
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[65dvh] overflow-y-auto overscroll-contain px-5 pb-6 custom-scrollbar">
          {isError ? (
            <ChangeHistoryError onRetry={() => void refetch()} />
          ) : isLoading && hasCourses ? (
            <ChangeHistorySkeleton />
          ) : groups.length === 0 ? (
            <ChangeHistoryEmpty hasCourses={hasCourses} />
          ) : (
            <ChangeHistoryList groups={groups} />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

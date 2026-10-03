"use client";

import { AdminCoursesView } from "@/components/admin/AdminCoursesView";
import { AdminStatsView } from "@/components/admin/AdminStatsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminTab = "stats" | "admin-courses";

type AdminAreaProps = {
  activeView: AdminTab;
  onViewChange: (view: AdminTab) => void;
};

export function AdminArea({ activeView, onViewChange }: AdminAreaProps) {
  return (
    <Tabs
      value={activeView}
      onValueChange={(value) => onViewChange(value as AdminTab)}
      className="flex h-full min-h-0 flex-col gap-3"
    >
      <TabsList className="w-fit self-start">
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="admin-courses">Corsi</TabsTrigger>
      </TabsList>
      <TabsContent
        value="stats"
        className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar"
      >
        <AdminStatsView />
      </TabsContent>
      <TabsContent
        value="admin-courses"
        className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar"
      >
        <AdminCoursesView />
      </TabsContent>
    </Tabs>
  );
}

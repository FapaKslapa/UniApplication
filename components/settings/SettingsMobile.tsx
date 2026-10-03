"use client";

import { BookOpen, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CoursesScreen } from "@/components/settings/CoursesScreen";
import { MenuScreen } from "@/components/settings/MenuScreen";
import { ScreenFooter } from "@/components/settings/ScreenFooter";
import { SubjectsScreen } from "@/components/settings/SubjectsScreen";
import {
  getConfigSummary,
  getSubjectsSummary,
} from "@/components/settings/summaries";
import type { CourseDraft } from "@/components/settings/useCourseDraft";
import { useSaveSettings } from "@/components/settings/useSaveSettings";
import type { SubjectVisibility } from "@/components/settings/useSubjectVisibility";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type SettingsMobileProps = {
  isSetup: boolean;
  isAdmin: boolean;
  draft: CourseDraft;
  visibility: SubjectVisibility;
  error: string | null;
  setError: (message: string | null) => void;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
};

export function SettingsMobile({
  isSetup,
  isAdmin,
  draft,
  visibility,
  error,
  setError,
  onOpenAdmin,
  onLogoutAdmin,
}: SettingsMobileProps) {
  const router = useRouter();
  const [coursesOpen, setCoursesOpen] = useState(isSetup);
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  const save = useSaveSettings({
    draft,
    setError,
    onSaved: () => {
      setCoursesOpen(false);
      setSubjectsOpen(true);
    },
  });

  const configSummary = getConfigSummary(draft.selectedCourses);
  const subjectsSummary = getSubjectsSummary(visibility, draft.hasConfig);

  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground md:hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <MenuScreen
          hasConfig={draft.hasConfig}
          configSummary={configSummary}
          subjectsSummary={subjectsSummary}
          selectedCourses={draft.selectedCourses}
          isAdmin={isAdmin}
          onOpenCourses={() => setCoursesOpen(true)}
          onOpenSubjects={() => setSubjectsOpen(true)}
          onOpenAdmin={onOpenAdmin}
          onLogoutAdmin={onLogoutAdmin}
        />
      </div>

      {!isSetup && (
        <BottomNav
          activeView="week"
          onViewChange={(view) => router.push(`/?view=${view}`)}
          onSettings={() => {}}
          activeSection="settings"
        />
      )}

      <Drawer
        open={coursesOpen}
        onOpenChange={isSetup ? undefined : setCoursesOpen}
        dismissible={!isSetup}
      >
        <DrawerContent className="flex h-[85vh] flex-col bg-popover">
          <DrawerHeader className="flex-row items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground elevation-1">
              <BookOpen className="size-5" aria-hidden />
            </div>
            <div className="text-left">
              <DrawerTitle className="text-xl">I miei corsi</DrawerTitle>
              <DrawerDescription>
                Scegli corso di laurea e anno: vedrai solo le loro lezioni
              </DrawerDescription>
            </div>
          </DrawerHeader>
          <CoursesScreen draft={draft} />
          {error && (
            <p className="mx-4 mb-3 shrink-0 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </p>
          )}
          <ScreenFooter
            primaryLabel={isSetup ? "Inizia" : "Salva e continua"}
            onPrimary={save}
            primaryDisabled={!draft.hasConfig}
          />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={subjectsOpen}
        onOpenChange={isSetup ? undefined : setSubjectsOpen}
        dismissible={!isSetup}
      >
        <DrawerContent className="flex h-[85vh] flex-col bg-popover">
          <DrawerHeader className="flex-row items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground elevation-1">
              <Eye className="size-5" aria-hidden />
            </div>
            <div className="text-left">
              <DrawerTitle className="text-xl">Materie visibili</DrawerTitle>
              <DrawerDescription>
                Spegni le materie che non vuoi vedere nell&apos;orario
              </DrawerDescription>
            </div>
          </DrawerHeader>
          <SubjectsScreen visibility={visibility} />
          <ScreenFooter
            primaryLabel={isSetup ? "Vai all'orario" : "Fatto"}
            onPrimary={() => {
              if (isSetup) {
                router.push("/");
                return;
              }
              setSubjectsOpen(false);
            }}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}

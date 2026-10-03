"use client";

import { ArrowLeft, BookOpen, Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AdminLoginDialog } from "@/components/admin/AdminLoginDialog";
import { BottomNav } from "@/components/BottomNav";
import { CoursesScreen } from "@/components/settings/CoursesScreen";
import { MenuScreen } from "@/components/settings/MenuScreen";
import { ScreenFooter } from "@/components/settings/ScreenFooter";
import { SubjectsScreen } from "@/components/settings/SubjectsScreen";
import {
  getConfigSummary,
  getSubjectsSummary,
} from "@/components/settings/summaries";
import { useCourseDraft } from "@/components/settings/useCourseDraft";
import { useSaveSettings } from "@/components/settings/useSaveSettings";
import { useSubjectVisibility } from "@/components/settings/useSubjectVisibility";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";

  const { isAdmin, setIsAdmin } = useAppStore();

  const [coursesOpen, setCoursesOpen] = useState(isSetup);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const draft = useCourseDraft({ onEdit: () => setError(null) });
  const visibility = useSubjectVisibility();
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
    <div className="fixed inset-0 flex flex-col bg-background text-foreground">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!isSetup && (
          <div className="mx-auto hidden max-w-lg items-center gap-2 px-4 pt-5 md:flex">
            <Button
              variant="outline"
              size="icon"
              aria-label="Torna all'agenda"
              onClick={() => router.push("/")}
              className="rounded-full elevation-1"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-lg font-bold leading-none">Impostazioni</h1>
          </div>
        )}
        <MenuScreen
          hasConfig={draft.hasConfig}
          configSummary={configSummary}
          subjectsSummary={subjectsSummary}
          selectedCourses={draft.selectedCourses}
          isAdmin={isAdmin}
          onOpenCourses={() => setCoursesOpen(true)}
          onOpenSubjects={() => setSubjectsOpen(true)}
          onOpenAdmin={() => setIsAdminLoginOpen(true)}
          onLogoutAdmin={async () => {
            await authClient.signOut();
            setIsAdmin(false);
          }}
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

      <AdminLoginDialog
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => router.push("/?view=stats")}
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HomeHeader } from "@/components/home/HomeHeader";
import { CoursesPanel } from "@/components/settings/desktop/CoursesPanel";
import { DevPanel } from "@/components/settings/desktop/DevPanel";
import { NotificationsPanel } from "@/components/settings/desktop/NotificationsPanel";
import { PreferencesPanel } from "@/components/settings/desktop/PreferencesPanel";
import { SubjectsPanel } from "@/components/settings/desktop/SubjectsPanel";
import { SupportPanel } from "@/components/settings/desktop/SupportPanel";
import type { CourseDraft } from "@/components/settings/useCourseDraft";
import { useSaveSettings } from "@/components/settings/useSaveSettings";
import type { SubjectVisibility } from "@/components/settings/useSubjectVisibility";

const SAVED_FEEDBACK_MS = 2500;

type SettingsDesktopProps = {
  isSetup: boolean;
  isAdmin: boolean;
  draft: CourseDraft;
  visibility: SubjectVisibility;
  error: string | null;
  setError: (message: string | null) => void;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
};

export function SettingsDesktop({
  isSetup,
  isAdmin,
  draft,
  visibility,
  error,
  setError,
  onOpenAdmin,
  onLogoutAdmin,
}: SettingsDesktopProps) {
  const router = useRouter();
  const [justSaved, setJustSaved] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const save = useSaveSettings({
    draft,
    setError,
    onSaved: () => {
      setJustSaved(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setJustSaved(false), SAVED_FEEDBACK_MS);
      if (isSetup) setSetupDone(true);
      document
        .getElementById("materie")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  });

  return (
    <div className="fixed inset-0 hidden overflow-y-auto overscroll-contain bg-background text-foreground md:block">
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-3 md:px-6 lg:px-8 lg:py-6">
        <HomeHeader
          title="Impostazioni"
          subtitle={
            isSetup ? "Scegli il tuo corso per iniziare" : "Orario Insubria"
          }
          showTitle
          activeView={null}
          settingsActive
          isAdmin={isAdmin}
          showRefresh={false}
          isRefreshing={false}
          onViewChange={(view) => router.push(`/?view=${view}`)}
          onRefresh={() => {}}
          onOpenSettings={() => {}}
        />
        <div className="grid items-start gap-4 pb-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6">
          <CoursesPanel
            draft={draft}
            error={error}
            isSetup={isSetup}
            justSaved={justSaved}
            onSave={save}
            className="lg:sticky lg:top-6 lg:h-[calc(100dvh-9.5rem)]"
          />
          <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
            <SubjectsPanel
              hasConfig={draft.hasConfig}
              visibility={visibility}
              showContinue={isSetup && setupDone}
              onContinue={() => router.push("/")}
            />
            {draft.hasConfig && (
              <NotificationsPanel courses={draft.selectedCourses} />
            )}
            <PreferencesPanel />
            <SupportPanel />
            <DevPanel
              isAdmin={isAdmin}
              onAdmin={onOpenAdmin}
              onLogoutAdmin={onLogoutAdmin}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

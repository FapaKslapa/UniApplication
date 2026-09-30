"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AdminLoginDialog } from "@/components/admin/AdminLoginDialog";
import { BottomNav } from "@/components/BottomNav";
import { CoursesScreen } from "@/components/settings/CoursesScreen";
import { MenuScreen } from "@/components/settings/MenuScreen";
import { ScreenFooter } from "@/components/settings/ScreenFooter";
import { ScreenHeader } from "@/components/settings/ScreenHeader";
import { SubjectsScreen } from "@/components/settings/SubjectsScreen";
import {
  getConfigSummary,
  getSubjectsSummary,
} from "@/components/settings/summaries";
import type { SettingsScreenName } from "@/components/settings/types";
import { useCourseDraft } from "@/components/settings/useCourseDraft";
import { useSaveSettings } from "@/components/settings/useSaveSettings";
import { useSubjectVisibility } from "@/components/settings/useSubjectVisibility";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/lib/store";

const SCREEN_TITLES: Record<SettingsScreenName, string> = {
  menu: "Impostazioni",
  courses: "Corsi e ruolo",
  subjects: "Materie visibili",
};

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

  const {
    userRole: savedUserRole,
    professorName: savedProfessorName,
    ensureUserId,
    isAdmin,
    setIsAdmin,
  } = useAppStore();

  const [screen, setScreen] = useState<SettingsScreenName>(
    isSetup ? "courses" : "menu",
  );
  const [error, setError] = useState<string | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const userId = ensureUserId();

  const draft = useCourseDraft({ userId, onEdit: () => setError(null) });
  const visibility = useSubjectVisibility(draft);
  const save = useSaveSettings({
    draft,
    userId,
    setError,
    onSaved: () => setScreen("subjects"),
  });

  const configSummary = getConfigSummary(
    savedUserRole,
    savedProfessorName,
    draft.selectedCourses,
  );
  const subjectsSummary = getSubjectsSummary(visibility, draft.hasConfig);

  const goBack = () => {
    if (screen === "menu") router.back();
    else if (screen === "subjects") setScreen("courses");
    else setScreen("menu");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground">
      <ScreenHeader
        title={SCREEN_TITLES[screen]}
        onBack={isSetup ? undefined : goBack}
        action={
          screen === "subjects"
            ? { label: "Fatto", onClick: () => router.push("/") }
            : undefined
        }
      />

      <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/30">
        <AnimatePresence mode="wait" initial={false}>
          {screen === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 overflow-y-auto overscroll-contain"
            >
              <MenuScreen
                hasConfig={draft.hasConfig}
                configSummary={configSummary}
                subjectsSummary={subjectsSummary}
                savedUserRole={savedUserRole}
                selectedCourses={draft.selectedCourses}
                isAdmin={isAdmin}
                onOpenCourses={() => setScreen("courses")}
                onOpenSubjects={() => setScreen("subjects")}
                onOpenAdmin={() => setIsAdminLoginOpen(true)}
                onLogoutAdmin={async () => {
                  await authClient.signOut();
                  setIsAdmin(false);
                }}
              />
            </motion.div>
          )}

          {screen === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col"
            >
              <CoursesScreen draft={draft} />
              {error && (
                <p className="mx-4 mb-3 shrink-0 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {error}
                </p>
              )}
              <ScreenFooter
                onBack={isSetup ? undefined : () => setScreen("menu")}
                primaryLabel={isSetup ? "Inizia" : "Salva e continua"}
                onPrimary={save}
                primaryDisabled={!draft.hasConfig}
              />
            </motion.div>
          )}

          {screen === "subjects" && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col"
            >
              <SubjectsScreen visibility={visibility} />
              <ScreenFooter
                onBack={isSetup ? undefined : () => setScreen("courses")}
                primaryLabel={isSetup ? "Inizia" : "Vai all'orario"}
                onPrimary={() => router.push("/")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {screen === "menu" && !isSetup && (
        <BottomNav
          activeView="week"
          onViewChange={(view) => router.push(`/?view=${view}`)}
          onSettings={() => {}}
          activeSection="settings"
        />
      )}

      <AdminLoginDialog
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => router.push("/?view=stats")}
      />
    </div>
  );
}

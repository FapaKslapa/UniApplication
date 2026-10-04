import { BookOpen, Eye, Mail } from "lucide-react";
import { AgendaModeRow } from "@/components/settings/AgendaModeRow";
import { CourseNotifications } from "@/components/settings/CourseNotifications";
import { DevSection } from "@/components/settings/DevSection";
import { MenuRow } from "@/components/settings/MenuRow";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { ThemeRow } from "@/components/settings/ThemeRow";
import type { Course } from "@/lib/courses";

const SUPPORT_EMAIL = "stefanomarocco0@gmail.com";

type MenuScreenProps = {
  hasConfig: boolean;
  configSummary: string;
  subjectsSummary: string;
  selectedCourses: Course[];
  isAdmin: boolean;
  onOpenCourses: () => void;
  onOpenSubjects: () => void;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
};

export function MenuScreen({
  hasConfig,
  configSummary,
  subjectsSummary,
  selectedCourses,
  isAdmin,
  onOpenCourses,
  onOpenSubjects,
  onOpenAdmin,
  onLogoutAdmin,
}: MenuScreenProps) {
  return (
    <div className="mx-auto max-w-lg space-y-1 px-4 py-5 pb-28 md:pb-10">
      <SettingsGroup label="Configurazione">
        <MenuRow
          key="courses"
          icon={BookOpen}
          tone="neutral"
          title="I miei corsi"
          subtitle={configSummary}
          badge={!hasConfig ? "Scegli" : undefined}
          onClick={onOpenCourses}
        />
        <MenuRow
          key="subjects"
          icon={Eye}
          tone="neutral"
          title="Materie visibili"
          subtitle={hasConfig ? subjectsSummary : "Scegli prima un corso"}
          disabled={!hasConfig}
          onClick={() => hasConfig && onOpenSubjects()}
        />
      </SettingsGroup>

      {hasConfig && selectedCourses.length > 0 && (
        <CourseNotifications courses={selectedCourses} />
      )}

      <SettingsGroup label="Altro">
        <ThemeRow key="theme" />
        <AgendaModeRow key="agenda-mode" />
        <MenuRow
          key="feedback"
          icon={Mail}
          title="Scrivici un suggerimento"
          subtitle={SUPPORT_EMAIL}
          hideChevron
          onClick={() => {
            window.location.href = `mailto:${SUPPORT_EMAIL}`;
          }}
        />
      </SettingsGroup>

      <div className="pt-5">
        <DevSection
          isAdmin={isAdmin}
          onAdmin={onOpenAdmin}
          onLogoutAdmin={onLogoutAdmin}
        />
      </div>
    </div>
  );
}

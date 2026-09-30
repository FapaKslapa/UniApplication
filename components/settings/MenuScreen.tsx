import { Eye, GraduationCap, Mail } from "lucide-react";
import { CourseNotifications } from "@/components/settings/CourseNotifications";
import { DevSection } from "@/components/settings/DevSection";
import { LocationSwitcher } from "@/components/settings/LocationSwitcher";
import { MenuRow } from "@/components/settings/MenuRow";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { ThemeRow } from "@/components/settings/ThemeRow";
import type { UserRole } from "@/components/settings/types";
import type { Course } from "@/lib/courses";

const SUPPORT_EMAIL = "stefanomarocco0@gmail.com";

type MenuScreenProps = {
  hasConfig: boolean;
  configSummary: string;
  subjectsSummary: string;
  savedUserRole: UserRole;
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
  savedUserRole,
  selectedCourses,
  isAdmin,
  onOpenCourses,
  onOpenSubjects,
  onOpenAdmin,
  onLogoutAdmin,
}: MenuScreenProps) {
  const showNotifications =
    hasConfig && savedUserRole === "student" && selectedCourses.length > 0;

  return (
    <div className="mx-auto max-w-lg space-y-1 px-4 py-5 pb-28 md:pb-10">
      <SettingsGroup label="Configurazione">
        <MenuRow
          icon={GraduationCap}
          tone="neutral"
          title="Corsi e ruolo"
          subtitle={configSummary}
          badge={!hasConfig ? "Da configurare" : undefined}
          onClick={onOpenCourses}
        />
        <MenuRow
          icon={Eye}
          tone="neutral"
          title="Materie visibili"
          subtitle={subjectsSummary}
          disabled={!hasConfig}
          onClick={() => hasConfig && onOpenSubjects()}
        />
      </SettingsGroup>

      {showNotifications && <CourseNotifications courses={selectedCourses} />}

      <SettingsGroup label="Altro">
        <ThemeRow />
        {savedUserRole === "student" && <LocationSwitcher />}
        <MenuRow
          icon={Mail}
          title="Suggerimenti"
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

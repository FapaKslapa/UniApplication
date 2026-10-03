import { PushNotificationManager } from "@/components/PushNotificationManager";
import { DesktopPanel } from "@/components/settings/desktop/DesktopPanel";
import type { Course } from "@/lib/courses";

type NotificationsPanelProps = { courses: Course[] };

export function NotificationsPanel({ courses }: NotificationsPanelProps) {
  return (
    <DesktopPanel
      title="Notifiche"
      description="Ti avvisiamo quando una lezione cambia orario o aula, o viene annullata"
    >
      {courses.map((course) => (
        <div
          key={course.id}
          className="flex items-center justify-between gap-3 border-t border-border px-4 py-2"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {course.name}
          </span>
          <PushNotificationManager linkId={course.linkId} compact />
        </div>
      ))}
    </DesktopPanel>
  );
}

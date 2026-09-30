import { BellRing } from "lucide-react";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { IconTile } from "@/components/settings/IconTile";
import { Separator } from "@/components/ui/separator";
import type { Course } from "@/lib/courses";

type CourseNotificationsProps = { courses: Course[] };

export function CourseNotifications({ courses }: CourseNotificationsProps) {
  return (
    <section>
      <h2 className="px-1 pt-5 pb-2 text-xs font-semibold text-muted-foreground">
        Notifiche
      </h2>
      <div className="overflow-hidden rounded-lg bg-card elevation-1">
        <div className="flex items-center gap-3 p-4">
          <IconTile icon={BellRing} tone="success" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ricevi una notifica quando un corso cambia orario, aula o viene
            annullato.
          </p>
        </div>
        <Separator />
        <div className="px-4">
          {courses.map((course, index) => (
            <div key={course.id}>
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between py-3">
                <span className="mr-3 flex-1 truncate text-sm font-semibold">
                  {course.name}
                </span>
                <PushNotificationManager linkId={course.linkId} compact />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

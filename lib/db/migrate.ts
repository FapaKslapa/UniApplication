import { db } from "@/lib/db/node";
import { courses } from "@/lib/db/schema";

interface JsonCourse {
  id: string;
  name: string;
  linkId: string;
  year: number;
  academicYear: string;
  verified: boolean;
  addedBy: string;
  userId?: string | null;
  createdAt: string;
}

export async function migrateJsonToDb() {
  if (process.env.DB) {
    console.log("Filesystem migration skipped in Cloudflare Edge environment.");
    return;
  }

  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const COURSES_FILE_PATH = path.join(process.cwd(), "data", "courses.json");
    const fileContent = await fs.readFile(COURSES_FILE_PATH, "utf-8");
    const { courses: jsonCourses } = JSON.parse(fileContent) as {
      courses: JsonCourse[];
    };

    if (!jsonCourses?.length) return;

    for (const course of jsonCourses) {
      const values = {
        ...course,
        createdAt: new Date(course.createdAt),
      };

      await db.insert(courses).values(values).onConflictDoUpdate({
        target: courses.id,
        set: values,
      });
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

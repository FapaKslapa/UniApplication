import type { HomeView } from "@/components/home/types";

type HomeTitleInput = {
  activeView: HomeView;
  courseNames: string[];
};

export function getHomeTitle({
  activeView,
  courseNames,
}: HomeTitleInput): string {
  if (activeView === "stats") return "Statistiche Sistema";
  if (activeView === "admin-courses") return "Gestione Corsi";
  if (courseNames.length === 0) return "Orario Insubria";
  if (courseNames.length === 1) return courseNames[0];
  return `${courseNames[0]} (+${courseNames.length - 1})`;
}

export function isAdminView(view: HomeView): boolean {
  return view === "stats" || view === "admin-courses";
}

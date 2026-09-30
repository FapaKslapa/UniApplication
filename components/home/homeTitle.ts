import type { HomeView } from "@/components/home/types";

interface HomeTitleInput {
  activeView: HomeView;
  isProfessor: boolean;
  professorName: string;
  courseNames: string[];
}

export function getHomeTitle({
  activeView,
  isProfessor,
  professorName,
  courseNames,
}: HomeTitleInput): string {
  if (activeView === "stats") return "Statistiche Sistema";
  if (activeView === "admin-courses") return "Gestione Corsi";
  if (isProfessor && professorName) return `Doc. ${professorName}`;
  if (courseNames.length === 0) return "Orario Insubria";
  if (courseNames.length === 1) return courseNames[0];
  return `${courseNames[0]} (+${courseNames.length - 1})`;
}

export function isAdminView(view: HomeView): boolean {
  return view === "stats" || view === "admin-courses";
}

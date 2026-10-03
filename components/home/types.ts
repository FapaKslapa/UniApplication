const HOME_VIEWS = [
  "week",
  "docenti",
  "esami",
  "stats",
  "admin-courses",
] as const;

export type HomeView = (typeof HOME_VIEWS)[number];

export function isHomeView(value: string | null): value is HomeView {
  return HOME_VIEWS.some((view) => view === value);
}

export type ChangeType = "ADDED" | "CANCELED" | "MODIFIED";

type ChangeDiff = {
  old: string;
  new: string;
};

export type TimetableChange = {
  type: ChangeType;
  title: string;
  date: string;
  time: string;
  location: string;
  professor: string;
  diffs?: {
    time?: ChangeDiff;
    location?: ChangeDiff;
    professor?: ChangeDiff;
  };
};

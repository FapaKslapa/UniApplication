import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AgendaMode } from "@/lib/agenda/types";

const MAX_RECENT_PROFESSORS = 8;

export type AppState = {
  calendarIds: string[];
  courseNames: string[];
  courseIds: string[];
  calendarId: string;
  courseName: string;
  storedCourseId: string;
  calendarUrlStore: string;
  hiddenSubjects: string[];
  favoriteProfessors: string[];
  recentProfessors: string[];
  defaultAgendaMode: AgendaMode;
  hasSeenWelcome: boolean;
  hasSeenNotifIntro: boolean;
  userId: string;
  isAdmin: boolean;

  setCalendarIds: (v: string[]) => void;
  setCourseNames: (v: string[]) => void;
  setCourseIds: (v: string[]) => void;
  setCalendarId: (v: string) => void;
  setCourseName: (v: string) => void;
  setStoredCourseId: (v: string) => void;
  setCalendarUrlStore: (v: string) => void;
  setHiddenSubjects: (v: string[]) => void;
  toggleFavoriteProfessor: (name: string) => void;
  addRecentProfessor: (name: string) => void;
  setDefaultAgendaMode: (v: AgendaMode) => void;
  setHasSeenWelcome: (v: boolean) => void;
  setHasSeenNotifIntro: (v: boolean) => void;
  ensureUserId: () => string;
  setIsAdmin: (v: boolean) => void;
};

function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      calendarIds: [],
      courseNames: [],
      courseIds: [],
      calendarId: "",
      courseName: "",
      storedCourseId: "",
      calendarUrlStore: "",
      hiddenSubjects: [],
      favoriteProfessors: [],
      recentProfessors: [],
      defaultAgendaMode: "day",
      hasSeenWelcome: false,
      hasSeenNotifIntro: false,
      userId: "",
      isAdmin: false,

      setCalendarIds: (v) => set({ calendarIds: v }),
      setCourseNames: (v) => set({ courseNames: v }),
      setCourseIds: (v) => set({ courseIds: v }),
      setCalendarId: (v) => set({ calendarId: v }),
      setCourseName: (v) => set({ courseName: v }),
      setStoredCourseId: (v) => set({ storedCourseId: v }),
      setCalendarUrlStore: (v) => set({ calendarUrlStore: v }),
      setHiddenSubjects: (v) => set({ hiddenSubjects: v }),
      toggleFavoriteProfessor: (name) => {
        const current = get().favoriteProfessors;
        set({
          favoriteProfessors: current.includes(name)
            ? current.filter((n) => n !== name)
            : [...current, name],
        });
      },
      addRecentProfessor: (name) => {
        const current = get().recentProfessors.filter((n) => n !== name);
        set({
          recentProfessors: [name, ...current].slice(0, MAX_RECENT_PROFESSORS),
        });
      },
      setDefaultAgendaMode: (v) => set({ defaultAgendaMode: v }),
      setHasSeenWelcome: (v) => set({ hasSeenWelcome: v }),
      setHasSeenNotifIntro: (v) => set({ hasSeenNotifIntro: v }),
      ensureUserId: () => {
        const current = get().userId;
        if (current) return current;
        const newId = generateUserId();
        set({ userId: newId });
        return newId;
      },
      setIsAdmin: (v) => set({ isAdmin: v }),
    }),
    {
      name: "uni-app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { isAdmin, setIsAdmin, ...rest } = state as AppState;
        void isAdmin;
        void setIsAdmin;
        return rest as Omit<AppState, "isAdmin" | "setIsAdmin">;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          const migrate = (key: string) => {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
          };
          if (state.calendarIds.length === 0) {
            const legacyIds = migrate("calendarIds");
            const legacyId = migrate("calendarId");
            if (legacyIds?.length) state.calendarIds = legacyIds;
            else if (legacyId) state.calendarIds = [legacyId];
          }
          if (state.courseNames.length === 0) {
            const legacy = migrate("courseNames");
            if (legacy?.length) state.courseNames = legacy;
          }
          if (state.courseIds.length === 0) {
            const legacy = migrate("courseIds");
            if (legacy?.length) state.courseIds = legacy;
          }
          if (!state.hiddenSubjects.length) {
            const legacy = migrate("hiddenSubjects");
            if (legacy?.length) state.hiddenSubjects = legacy;
          }
          if (!state.favoriteProfessors.length) {
            const legacyProfessorName = (
              JSON.parse(localStorage.getItem("uni-app-storage") ?? "{}")
                ?.state as { professorName?: string } | undefined
            )?.professorName;
            if (legacyProfessorName) {
              state.favoriteProfessors = [legacyProfessorName];
            }
          }
          if (!state.hasSeenWelcome) {
            const legacy = migrate("hasSeenWelcomeV2");
            if (legacy) state.hasSeenWelcome = legacy;
          }
          if (!state.hasSeenNotifIntro) {
            const legacy = migrate("hasSeenNotifIntroV1");
            if (legacy) state.hasSeenNotifIntro = legacy;
          }
          if (!state.userId) {
            const legacy = migrate("userId");
            if (legacy) state.userId = legacy;
          }
        } catch {}
      },
    },
  ),
);

export function useActiveLinkIds(): string[] {
  const calendarIds = useAppStore((state) => state.calendarIds);
  const calendarId = useAppStore((state) => state.calendarId);
  return calendarIds.length > 0 ? calendarIds : calendarId ? [calendarId] : [];
}

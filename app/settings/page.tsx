"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BellRing,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Github,
  GraduationCap,
  Info,
  Link2,
  Mail,
  Moon,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Sun,
  UserCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { SkeletonList } from "@/components/LoadingScreen";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AcademicYearPicker } from "@/components/ui/academic-year-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Course } from "@/lib/courses";
import { extractCalendarId } from "@/lib/orario-utils";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const _INITIAL_HIDDEN_SUBJECTS: string[] = [];

type Screen = "menu" | "courses" | "subjects";

/* ─────────────────────────────────────────────
   Schermata: lista corsi selezionabili
───────────────────────────────────────────── */
function CoursesScreen({
  allCourses,
  selectedCourses,
  toggleCourseSelection,
  setError,
  copiedCourseId,
  handleCopyCourseLink,
  userRole,
  setUserRole,
  professorName,
  setProfessorName,
  professors,
  isLoadingProfessors,
  calendarUrl,
  handleUrlChange,
  previewIds,
  handleCopyLink,
  copiedLink,
  newCourseName,
  setNewCourseName,
  newCourseYear,
  setNewCourseYear,
  newAcademicYear,
  setNewAcademicYear,
}: {
  allCourses: Course[];
  selectedCourses: Course[];
  toggleCourseSelection: (c: Course) => void;
  setError: (e: string | null) => void;
  copiedCourseId: string | null;
  handleCopyCourseLink: (
    linkId: string,
    courseId: string,
    e: React.MouseEvent,
  ) => void;
  userRole: "student" | "professor";
  setUserRole: (r: "student" | "professor") => void;
  professorName: string;
  setProfessorName: (n: string) => void;
  professors: string[];
  isLoadingProfessors: boolean;
  calendarUrl: string;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewIds: string[];
  handleCopyLink: () => void;
  copiedLink: boolean;
  newCourseName: string;
  setNewCourseName: (v: string) => void;
  newCourseYear: number | "";
  setNewCourseYear: (v: number | "") => void;
  newAcademicYear: string;
  setNewAcademicYear: (v: string) => void;
}) {
  const [tab, setTab] = useState<"select" | "add">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [profSearch, setProfSearch] = useState("");

  const filteredCourses = allCourses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredProfs = professors.filter((p) =>
    p.toLowerCase().includes(profSearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Switcher ruolo — stile pill identico a page.tsx */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setUserRole("student");
              setError(null);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
              userRole === "student"
                ? "bg-white dark:bg-white text-black shadow-sm"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Studente
          </button>
          <button
            type="button"
            onClick={() => {
              setUserRole("professor");
              setError(null);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
              userRole === "professor"
                ? "bg-white dark:bg-white text-black shadow-sm"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
            )}
          >
            <UserCircle className="w-3.5 h-3.5" />
            Docente
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {userRole === "student" ? (
          <motion.div
            key="student"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Tab switcher stile pill */}
            <div className="px-4 pb-3 shrink-0">
              <div className="flex bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 p-1 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("select");
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    tab === "select"
                      ? "bg-white dark:bg-white text-black shadow-sm"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
                  )}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Seleziona corso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("add");
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    tab === "add"
                      ? "bg-white dark:bg-white text-black shadow-sm"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300",
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Aggiungi nuovo
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {tab === "select" ? (
                <motion.div
                  key="sel"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.12 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  {/* Search */}
                  <div className="px-4 pb-2 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cerca corso..."
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                      />
                    </div>
                  </div>
                  {/* Lista */}
                  <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-1.5">
                    {allCourses.length === 0 && searchQuery === "" ? (
                      <SkeletonList rows={5} />
                    ) : filteredCourses.length === 0 ? (
                      <p className="text-center text-sm text-zinc-500 dark:text-zinc-600 py-8 font-serif italic">
                        Nessun corso trovato.
                      </p>
                    ) : null}
                    {filteredCourses.map((course) => {
                      const isSel = selectedCourses.some(
                        (c) => c.id === course.id,
                      );
                      return (
                        <div key={course.id} className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              toggleCourseSelection(course);
                              setError(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3.5 pr-20 rounded-2xl border transition-all text-left active:scale-[0.98]",
                              isSel
                                ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black"
                                : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-950",
                            )}
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                                isSel
                                  ? "bg-white dark:bg-black border-white dark:border-black"
                                  : "border-zinc-300 dark:border-zinc-700",
                              )}
                            >
                              {isSel && (
                                <Check className="w-3 h-3 text-zinc-900 dark:text-white stroke-[3]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-bold text-sm truncate",
                                  isSel
                                    ? "text-white dark:text-black"
                                    : "text-zinc-900 dark:text-white",
                                )}
                              >
                                {course.name}
                              </p>
                              {course.year && (
                                <p className="text-[10px] font-mono mt-0.5 text-zinc-400 dark:text-zinc-500">
                                  {course.year}° Anno
                                </p>
                              )}
                            </div>
                          </button>
                          {/* Notifiche compact + copia link */}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {isSel && (
                              // biome-ignore lint/a11y/noStaticElementInteractions: stop propagation wrapper
                              <span
                                role="presentation"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              >
                                <PushNotificationManager
                                  linkId={course.linkId}
                                  compact
                                />
                              </span>
                            )}
                            <button
                              type="button"
                              title="Copia link"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCourseLink(
                                  course.linkId,
                                  course.id,
                                  e,
                                );
                              }}
                              className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-90",
                                copiedCourseId === course.id
                                  ? isSel
                                    ? "text-zinc-400"
                                    : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                                  : isSel
                                    ? "text-zinc-400 hover:text-zinc-600"
                                    : "text-zinc-400 dark:text-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60",
                              )}
                            >
                              {copiedCourseId === course.id ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Link2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.12 }}
                  className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-4"
                >
                  <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-serif">
                        Il corso sarà{" "}
                        <span className="text-zinc-900 dark:text-white font-bold">
                          In Attesa
                        </span>{" "}
                        fino all'approvazione. Potrai usarlo subito, ma sarà
                        visibile agli altri solo dopo la verifica.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Field label="Nome del Corso">
                      <input
                        type="text"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="Es: Informatica - Varese"
                        className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                      />
                    </Field>
                    <Field
                      label="Link Calendario Cineca"
                      action={
                        previewIds.length > 0 ? (
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase transition-all",
                              copiedLink
                                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500",
                            )}
                          >
                            {copiedLink ? (
                              <Check className="w-2.5 h-2.5" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                            {copiedLink ? "Copiato" : "Copia"}
                          </button>
                        ) : undefined
                      }
                    >
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                        <input
                          type="text"
                          value={calendarUrl}
                          onChange={handleUrlChange}
                          placeholder="Incolla l'URL del calendario Cineca..."
                          className="w-full pl-9 pr-4 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                        />
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Anno">
                        <Select
                          value={
                            newCourseYear === "" ? "" : String(newCourseYear)
                          }
                          onValueChange={(v) =>
                            setNewCourseYear(v === "" ? "" : Number(v))
                          }
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white">
                            <SelectValue placeholder="Seleziona..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            {[1, 2, 3, 4, 5, 6].map((y) => (
                              <SelectItem
                                key={y}
                                value={String(y)}
                                className="rounded-xl"
                              >
                                {y}° Anno
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Anno Accademico">
                        <AcademicYearPicker
                          value={newAcademicYear}
                          onChange={setNewAcademicYear}
                          className="h-11 rounded-xl text-sm"
                        />
                      </Field>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── Vista docente ── */
          <motion.div
            key="professor"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="px-4 pb-2 shrink-0">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-serif italic mb-3">
                Cerca il tuo nome nell'elenco dei docenti per caricare il tuo
                orario personale.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                <input
                  type="text"
                  value={profSearch}
                  onChange={(e) => setProfSearch(e.target.value)}
                  placeholder="Cerca il tuo nome..."
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-1.5">
              {isLoadingProfessors ? (
                <SkeletonList rows={5} />
              ) : filteredProfs.length === 0 ? (
                <p className="text-center text-sm text-zinc-400 py-8 font-serif italic">
                  Nessun docente trovato.
                </p>
              ) : (
                filteredProfs.map((prof) => {
                  const isSel = professorName === prof;
                  return (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => setProfessorName(prof)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left active:scale-[0.98]",
                        isSel
                          ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black"
                          : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-950",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                          isSel
                            ? "bg-white dark:bg-black border-white dark:border-black"
                            : "border-zinc-300 dark:border-zinc-700",
                        )}
                      >
                        {isSel && (
                          <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold uppercase tracking-tight font-mono truncate",
                          isSel
                            ? "text-white dark:text-black"
                            : "text-zinc-900 dark:text-white",
                        )}
                      >
                        {prof}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Schermata: filtro materie
───────────────────────────────────────────── */
function SubjectsScreen({
  availableSubjects,
  isLoadingSubjects,
  hiddenSubjects,
  toggleSubject,
}: {
  availableSubjects: string[] | undefined;
  isLoadingSubjects: boolean;
  hiddenSubjects: string[];
  toggleSubject: (s: string) => void;
}) {
  const visibleCount = availableSubjects
    ? availableSubjects.length -
      hiddenSubjects.filter((s) => availableSubjects.includes(s)).length
    : 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 pt-4 pb-3 shrink-0 flex items-center justify-between">
        <p className="text-xs text-zinc-500 font-serif italic">
          Deseleziona le materie che non vuoi vedere nell'orario.
        </p>
        {!isLoadingSubjects &&
          availableSubjects &&
          availableSubjects.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest shrink-0 ml-3">
              {visibleCount}/{availableSubjects.length}
            </span>
          )}
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-1.5">
        {isLoadingSubjects ? (
          <SkeletonList rows={5} />
        ) : !availableSubjects || availableSubjects.length === 0 ? (
          <p className="text-center text-sm text-zinc-400 py-10 font-serif italic">
            Nessuna materia trovata per i prossimi 6 mesi.
          </p>
        ) : (
          availableSubjects.map((subject) => {
            const isHidden = hiddenSubjects.includes(subject);
            return (
              <button
                type="button"
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left active:scale-[0.98]",
                  isHidden
                    ? "bg-transparent border-zinc-200 dark:border-zinc-900 text-zinc-400 dark:text-zinc-700"
                    : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-950",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    isHidden
                      ? "border-zinc-300 dark:border-zinc-800"
                      : "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white",
                  )}
                >
                  {!isHidden && (
                    <Check className="w-3 h-3 text-white dark:text-black stroke-[3]" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-mono font-bold uppercase tracking-tight flex-1 truncate",
                    isHidden ? "line-through opacity-50" : "",
                  )}
                >
                  {subject.toLowerCase()}
                </span>
                {isHidden && (
                  <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-700 uppercase tracking-widest shrink-0">
                    Nascosta
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Pagina principale
───────────────────────────────────────────── */
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

  // ── store zustand ──
  const {
    calendarIds,
    setCalendarIds,
    setCourseNames,
    setCourseIds,
    calendarId,
    setCalendarId,
    setCourseName,
    setStoredCourseId,
    calendarUrlStore,
    setCalendarUrlStore,
    hiddenSubjects,
    setHiddenSubjects,
    userRole: savedUserRole,
    setUserRole: setSavedUserRole,
    professorName: savedProfessorName,
    setProfessorName: setSavedProfessorName,
    courseIds,
    storedCourseId,
    ensureUserId,
  } = useAppStore();

  // ── stato locale temporaneo (non persistito finché non si salva) ──
  const [draftRole, setDraftRole] = useState<"student" | "professor">(
    savedUserRole,
  );
  const [draftProfessorName, setDraftProfessorName] =
    useState(savedProfessorName);

  const [calendarUrl, setCalendarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewIds, setPreviewIds] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseYear, setNewCourseYear] = useState<number | "">("");
  const [newAcademicYear, setNewAcademicYear] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>(isSetup ? "courses" : "menu");

  const userId = ensureUserId();

  const { data: allCourses = [], refetch: refetchCourses } =
    api.courses.getAll.useQuery({ userId });
  const { data: professors = [], isLoading: isLoadingProfessors } =
    api.orario.getProfessors.useQuery(
      {},
      { enabled: draftRole === "professor" },
    );
  const addCourseMutation = api.courses.add.useMutation({
    onSuccess: () => {
      refetchCourses();
      setError(null);
    },
    onError: (err) =>
      setError(err.message || "Errore durante l'aggiunta del corso"),
  });
  const updateFiltersMutation =
    api.notifications.updateAllFilters.useMutation();

  // Init store → stato locale
  useEffect(() => {
    if (calendarIds.length === 0 && calendarId) {
      setCalendarIds([calendarId]);
    }
    if (calendarUrlStore) {
      setCalendarUrl(calendarUrlStore);
      const ex = extractCalendarId(calendarUrlStore);
      if (ex) setPreviewIds([ex]);
    } else if (calendarIds.length > 0) {
      setPreviewIds(calendarIds);
    } else if (calendarId) {
      setPreviewIds([calendarId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarId, calendarIds, calendarUrlStore, setCalendarIds]);

  useEffect(() => {
    if (allCourses.length > 0 && selectedCourses.length === 0) {
      const ids =
        courseIds.length > 0
          ? courseIds
          : storedCourseId
            ? [storedCourseId]
            : [];
      const matched = allCourses.filter((c) => ids.includes(c.id));
      if (matched.length > 0) {
        setSelectedCourses(matched);
        setPreviewIds(matched.map((c) => c.linkId));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCourses, courseIds, selectedCourses.length, storedCourseId]);

  const { data: availableSubjects, isLoading: isLoadingSubjects } =
    api.orario.getSubjects.useQuery(
      {
        linkIds:
          draftRole === "student"
            ? previewIds.length > 0
              ? previewIds
              : undefined
            : undefined,
        professorName:
          draftRole === "professor" ? draftProfessorName : undefined,
      },
      {
        enabled:
          (draftRole === "student" && previewIds.length > 0) ||
          (draftRole === "professor" && !!draftProfessorName),
      },
    );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCalendarUrl(url);
    setError(null);
    setCopiedLink(false);
    if (!url.trim()) {
      setPreviewIds(
        calendarIds.length > 0 ? calendarIds : calendarId ? [calendarId] : [],
      );
      return;
    }
    const ex = extractCalendarId(url);
    setPreviewIds(ex ? [ex] : []);
  };

  const toggleCourseSelection = (course: Course) => {
    setSelectedCourses((prev) => {
      const updated = prev.some((c) => c.id === course.id)
        ? prev.filter((c) => c.id !== course.id)
        : [...prev, course];
      setPreviewIds(updated.map((c) => c.linkId));
      return updated;
    });
  };

  const handleCopyLink = async () => {
    const link = calendarUrl || previewIds[0] || "";
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleCopyCourseLink = async (
    linkId: string,
    courseId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(linkId);
      setCopiedCourseId(courseId);
      setTimeout(() => setCopiedCourseId(null), 2000);
    } catch {}
  };

  const toggleSubject = (subject: string) => {
    const next = hiddenSubjects.includes(subject)
      ? hiddenSubjects.filter((s) => s !== subject)
      : [...hiddenSubjects, subject];
    setHiddenSubjects(next);
    if ("Notification" in window && Notification.permission === "granted")
      updateFiltersMutation.mutate({ filters: next });
  };

  const handleSaveAndBack = async () => {
    // Salva il ruolo draft → persistito
    if (draftRole === "professor") {
      if (!draftProfessorName) {
        setError("Seleziona il tuo nome docente.");
        return;
      }
      setSavedUserRole("professor");
      setSavedProfessorName(draftProfessorName);
      setCalendarIds([]);
      setCourseNames([]);
      setCourseIds([]);
      setCalendarId("");
      setCourseName("");
      setStoredCourseId("");
      setCalendarUrlStore("");
      setHiddenSubjects([]);
      setScreen("subjects");
      return;
    }
    // Studente — tab "aggiungi"
    if (newCourseName.trim() && previewIds.length > 0) {
      if (newCourseYear === "") {
        setError("Specifica l'anno del corso.");
        return;
      }
      try {
        const nc = await addCourseMutation.mutateAsync({
          name: newCourseName.trim(),
          linkId: previewIds[0],
          year: newCourseYear as number,
          academicYear: newAcademicYear || undefined,
          userId,
          addedBy: "user",
        });
        setSavedUserRole("student");
        setSavedProfessorName("");
        setCalendarIds([previewIds[0]]);
        setCourseNames([newCourseName.trim()]);
        setCourseIds([nc.id]);
        setHiddenSubjects([]);
        setCalendarId("");
        setCourseName("");
        setStoredCourseId("");
        setCalendarUrlStore(calendarUrl.includes("http") ? calendarUrl : "");
        setScreen("subjects");
        return;
      } catch {
        return;
      }
    }
    if (!selectedCourses.length) {
      setError("Seleziona almeno un corso.");
      return;
    }
    setSavedUserRole("student");
    setSavedProfessorName("");
    setCalendarIds(selectedCourses.map((c) => c.linkId));
    setCourseNames(selectedCourses.map((c) => c.name));
    setCourseIds(selectedCourses.map((c) => c.id));
    setHiddenSubjects([]);
    setCalendarId("");
    setCourseName("");
    setStoredCourseId("");
    setScreen("subjects");
  };

  const hasConfig =
    (draftRole === "student" &&
      (selectedCourses.length > 0 || previewIds.length > 0)) ||
    (draftRole === "professor" && !!draftProfessorName);

  const configSummary =
    savedUserRole === "professor"
      ? savedProfessorName || "Non configurato"
      : selectedCourses.length > 0
        ? selectedCourses.length === 1
          ? selectedCourses[0].name
          : `${selectedCourses.length} corsi selezionati`
        : "Non configurato";

  const subjectsSummary =
    availableSubjects && availableSubjects.length > 0
      ? `${availableSubjects.length - hiddenSubjects.filter((s) => availableSubjects.includes(s)).length} / ${availableSubjects.length} visibili`
      : hasConfig
        ? "Caricamento..."
        : "Configura prima un corso";

  const screenTitle: Record<Screen, string> = {
    menu: "Impostazioni",
    courses: "Corsi e Ruolo",
    subjects: "Materie visibili",
  };

  const handleBack = () => {
    if (screen === "menu") router.back();
    else if (screen === "subjects") setScreen("courses");
    else setScreen("menu");
  };

  // Schermata "courses": nasconde la BottomNav, mostra tasti navigazione
  const _isCoursesScreen = screen === "courses";

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-white">
      {/* ── HEADER ── */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black">
        {!isSetup && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.h1
              key={screen}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="text-base font-bold font-serif leading-none"
            >
              {screenTitle[screen]}
            </motion.h1>
          </AnimatePresence>
        </div>
        {screen === "subjects" && (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all"
          >
            Fatto
          </button>
        )}
      </header>

      {/* ── CONTENUTO ── */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-zinc-50 dark:bg-black">
        <AnimatePresence mode="wait" initial={false}>
          {/* ───── MENU PRINCIPALE ───── */}
          {screen === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 overflow-y-auto overscroll-contain bg-zinc-50 dark:bg-black"
            >
              <div className="max-w-lg mx-auto px-4 py-5 space-y-2 pb-28 md:pb-10">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono px-1 mb-3">
                  Configurazione
                </p>
                <MenuRow
                  icon={<GraduationCap className="w-4 h-4" />}
                  iconBg="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  title="Corsi e Ruolo"
                  subtitle={configSummary}
                  badge={!hasConfig ? "Da configurare" : undefined}
                  badgeColor="text-amber-500 dark:text-amber-400"
                  onClick={() => setScreen("courses")}
                />
                <MenuRow
                  icon={<Eye className="w-4 h-4" />}
                  iconBg="bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  title="Materie visibili"
                  subtitle={subjectsSummary}
                  disabled={!hasConfig}
                  onClick={() => hasConfig && setScreen("subjects")}
                />
                {hasConfig &&
                  savedUserRole === "student" &&
                  selectedCourses.length > 0 && (
                    <>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono px-1 pt-4 mb-3">
                        Notifiche
                      </p>
                      <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-900">
                          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-500/10 shrink-0">
                            <BellRing className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-serif leading-relaxed">
                            Ricevi una notifica quando un corso cambia orario,
                            aula o viene annullato.
                          </p>
                        </div>
                        <div className="px-4 divide-y divide-zinc-100 dark:divide-zinc-900">
                          {selectedCourses.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between py-3"
                            >
                              <span className="text-xs font-bold truncate flex-1 mr-3 text-zinc-700 dark:text-zinc-300">
                                {c.name}
                              </span>
                              <PushNotificationManager
                                linkId={c.linkId}
                                compact
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-mono px-1 pt-4 mb-3">
                  Altro
                </p>{" "}
                {/* Tema */}
                <div className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border bg-white dark:bg-black border-zinc-200 dark:border-zinc-800/60 text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    {/* Mostra il tema corrente: Sole in light, Luna in dark */}
                    <Sun className="w-4 h-4 block dark:hidden" />
                    <Moon className="w-4 h-4 hidden dark:block" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Tema
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      Chiaro / Scuro
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                <MenuRow
                  icon={<Mail className="w-4 h-4" />}
                  iconBg="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  title="Suggerimenti"
                  subtitle="stefanomarocco0@gmail.com"
                  onClick={() => {
                    window.location.href = "mailto:stefanomarocco0@gmail.com";
                  }}
                  noChevron
                />
                {/* Opzioni sviluppatore — collassabile */}
                <DevSection onAdmin={() => router.push("/admin")} />
              </div>
            </motion.div>
          )}

          {/* ───── CORSI ───── */}
          {screen === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col"
            >
              <CoursesScreen
                allCourses={allCourses}
                selectedCourses={selectedCourses}
                toggleCourseSelection={toggleCourseSelection}
                setError={setError}
                copiedCourseId={copiedCourseId}
                handleCopyCourseLink={handleCopyCourseLink}
                userRole={draftRole}
                setUserRole={(r) => {
                  // cambia solo il draft, non il valore salvato
                  setDraftRole(r);
                }}
                professorName={draftProfessorName}
                setProfessorName={setDraftProfessorName}
                professors={professors}
                isLoadingProfessors={isLoadingProfessors}
                calendarUrl={calendarUrl}
                handleUrlChange={handleUrlChange}
                previewIds={previewIds}
                handleCopyLink={handleCopyLink}
                copiedLink={copiedLink}
                newCourseName={newCourseName}
                setNewCourseName={setNewCourseName}
                newCourseYear={newCourseYear}
                setNewCourseYear={setNewCourseYear}
                newAcademicYear={newAcademicYear}
                setNewAcademicYear={setNewAcademicYear}
              />
              {error && (
                <div className="shrink-0 mx-4 mb-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-bold font-serif">{error}</span>
                </div>
              )}
              {/* Footer fisso — sostituisce la BottomNav in questa schermata */}
              <div
                className="shrink-0 px-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black flex gap-3"
                style={{
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                {/* Tasto indietro — nascosto in setup */}
                {!isSetup && (
                  <button
                    type="button"
                    onClick={() => setScreen("menu")}
                    className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-sm font-bold font-mono uppercase tracking-widest transition-all bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:opacity-80 active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveAndBack}
                  disabled={!hasConfig}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold font-mono uppercase tracking-widest transition-all",
                    hasConfig
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg active:scale-[0.98] hover:opacity-90"
                      : "bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-400 dark:text-zinc-700 cursor-not-allowed",
                  )}
                >
                  <Save className="w-4 h-4" />
                  {isSetup ? "Inizia" : "Salva e continua"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ───── MATERIE ───── */}
          {screen === "subjects" && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col"
            >
              <SubjectsScreen
                availableSubjects={availableSubjects}
                isLoadingSubjects={isLoadingSubjects}
                hiddenSubjects={hiddenSubjects}
                toggleSubject={toggleSubject}
              />
              <div
                className="shrink-0 px-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black flex gap-3"
                style={{
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                {!isSetup && (
                  <button
                    type="button"
                    onClick={() => setScreen("courses")}
                    className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-sm font-bold font-mono uppercase tracking-widest transition-all bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:opacity-80 active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold font-mono uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg active:scale-[0.98] hover:opacity-90 transition-all"
                >
                  {isSetup ? "Inizia" : "Vai all'orario"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM NAV — nascosta in courses/subjects e in setup ── */}
      {screen !== "courses" && screen !== "subjects" && !isSetup && (
        <BottomNav
          activeView="week"
          onViewChange={(v) => router.push(`/?view=${v}`)}
          onSettings={() => {}}
          activeSection="settings"
        />
      )}
    </div>
  );
}

/* ── DevSection: accordion "Opzioni sviluppatore" ── */
function DevSection({ onAdmin }: { onAdmin: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/60 overflow-hidden bg-white dark:bg-black">
      {/* Header collassabile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all active:scale-[0.98]"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            Opzioni sviluppatore
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            GitHub · Admin
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
        </motion.div>
      </button>

      {/* Contenuto espandibile */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-100 dark:border-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-900">
              {/* GitHub */}
              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://github.com/StefanoMarocco/UniApplication",
                    "_blank",
                  )
                }
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <Github className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Repository GitHub
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono truncate">
                    StefanoMarocco/UniApplication
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={onAdmin}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-500/15 text-red-500 dark:text-red-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Pannello Admin
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
                    Gestione corsi e statistiche
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Componenti helper ── */
function MenuRow({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  badgeColor,
  disabled,
  onClick,
  noChevron,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
  onClick: () => void;
  noChevron?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all text-left",
        disabled
          ? "bg-zinc-100 dark:bg-black border-zinc-200 dark:border-zinc-900 opacity-30 cursor-not-allowed"
          : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-950 active:scale-[0.98]",
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          iconBg,
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          {title}
        </p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
          {subtitle}
        </p>
      </div>
      {badge && (
        <span
          className={cn(
            "text-[9px] font-bold font-mono uppercase tracking-widest shrink-0",
            badgeColor,
          )}
        >
          {badge}
        </span>
      )}
      {!noChevron && !badge && (
        <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
      )}
    </button>
  );
}

function Field({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
          {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

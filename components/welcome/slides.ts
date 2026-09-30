import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Heart,
  type LucideIcon,
  Search,
  Sparkles,
} from "lucide-react";

export type WelcomeBullet = {
  icon: LucideIcon;
  text: string;
};

export type WelcomeSlide = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: WelcomeBullet[];
  note?: string;
};

export const slides: WelcomeSlide[] = [
  {
    id: "welcome",
    icon: Sparkles,
    title: "Benvenuto su UniOrario",
    description:
      "L'orario di tutto l'Ateneo Insubria in un'unica app, con l'Agenda del tuo corso e un modo veloce per trovare un docente.",
  },
  {
    id: "how-it-works",
    icon: CalendarDays,
    title: "Come funziona",
    description:
      "Seleziona i tuoi corsi dalle impostazioni e l'app costruirà la tua Agenda personalizzata: settimana e mese, con la lezione in corso, l'aula e il docente sempre in evidenza.",
    bullets: [
      { icon: CalendarDays, text: "Agenda settimanale e mensile" },
      { icon: Search, text: "Cerca un docente nel tab Docenti" },
      { icon: Bell, text: "Notifiche su cambi orario" },
    ],
  },
  {
    id: "community",
    icon: Heart,
    title: "Progetto della community",
    description:
      "UniOrario è un progetto open source fatto da studenti per studenti, con il codice pubblico su GitHub.",
    note: "Trovato un bug, manca il tuo corso o hai un'idea? Apri una issue su GitHub o scrivici.",
  },
  {
    id: "ready",
    icon: CheckCircle2,
    title: "Tutto pronto",
    description:
      "Un'ultima cosa: scegli i tuoi corsi e potrai attivare le notifiche in tempo reale con un tap.",
    bullets: [
      { icon: CalendarDays, text: "Scegli i corsi che segui" },
      { icon: Bell, text: "Attiva le notifiche quando vuoi" },
    ],
  },
];

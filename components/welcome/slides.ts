import {
  Bell,
  BellRing,
  CalendarDays,
  Heart,
  type LucideIcon,
  Sparkles,
  Zap,
} from "lucide-react";

export interface WelcomeBullet {
  icon: LucideIcon;
  text: string;
}

export interface WelcomeSlide {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  isRoleSelection?: boolean;
  bullets?: WelcomeBullet[];
  communityNote?: string;
}

export const slides: WelcomeSlide[] = [
  {
    id: "role-selection",
    icon: Sparkles,
    title: "Benvenuto su UniOrario",
    description:
      "L'orario di tutto l'Ateneo Insubria in un'unica app. Prima di iniziare, dimmi chi sei.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    isRoleSelection: true,
  },
  {
    id: "how-it-works",
    icon: Sparkles,
    title: "Come funziona",
    description:
      "Seleziona i tuoi corsi dalle impostazioni e l'app costruirà il tuo orario personalizzato. Puoi vedere la settimana corrente, navigare tra i mesi e scoprire in tempo reale la lezione in corso, l'aula e il docente.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    bullets: [
      { icon: CalendarDays, text: "Vista settimanale e mensile" },
      { icon: Zap, text: "Lezione in corso sempre visibile" },
      { icon: Bell, text: "Notifiche su cambi orario" },
    ],
  },
  {
    id: "notifications",
    icon: BellRing,
    title: "Resta sempre aggiornato",
    description:
      "Attiva le notifiche push: ti avvisiamo in tempo reale se una lezione viene spostata, cambia aula o viene annullata. Puoi scegliere per quali materie ricevere avvisi.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "community",
    icon: Heart,
    title: "Progetto della community",
    description:
      "UniOrario è un progetto open source fatto da studenti per studenti. Se manca il tuo corso puoi aggiungerlo tu stesso: verrà revisionato e reso disponibile a tutti.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    communityNote:
      "Trovato un bug o hai un'idea? Apri una issue su GitHub o scrivici.",
  },
];

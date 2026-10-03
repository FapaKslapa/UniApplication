import { BellRing, Clock, ListFilter, type LucideIcon } from "lucide-react";

export type WelcomeSlide = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  note?: string;
};

export const slides: WelcomeSlide[] = [
  {
    id: "next-lesson",
    icon: Clock,
    title: "Sai sempre cosa viene dopo",
    description:
      "Apri l'app e vedi subito la prossima lezione: a che ora inizia, in quale aula e con quale docente.",
  },
  {
    id: "changes",
    icon: BellRing,
    title: "Se qualcosa cambia, lo sai",
    description:
      "Aula cambiata o lezione annullata? Ti arriva una notifica sul telefono, senza dover ricontrollare l'orario.",
  },
  {
    id: "your-subjects",
    icon: ListFilter,
    title: "Solo le tue materie",
    description:
      "Scegli il tuo corso e nascondi quello che non ti serve: l'orario resta pulito, con dentro solo le tue lezioni.",
    note: "UniOrario è open source, fatto da studenti. Se manca il tuo corso o hai un'idea, scrivici dalle impostazioni.",
  },
];

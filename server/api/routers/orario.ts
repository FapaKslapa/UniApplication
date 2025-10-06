import puppeteer from "puppeteer";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Tipo per i dati dell'orario
type OrarioData = Array<{ day: number; events: Array<{ time: string; title: string }> }>;

// Cache in-memory per i dati dell'orario
let cachedData: { data: OrarioData; timestamp: number } | null = null;
const CACHE_TTL = 1000 * 60 * 30; // 30 minuti

const scrap = async (): Promise<OrarioData> => {
  // Controlla se abbiamo dati in cache ancora validi
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log('Returning cached data');
    return cachedData.data;
  }

  console.log('Scraping new data...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();

    // NON disabilitare le risorse - potrebbero essere necessarie per il rendering
    await page.goto(
      "https://unins.prod.up.cineca.it/calendarioPubblico/linkCalendarioId=68cb8d7de418fc00412a332a",
      { waitUntil: "networkidle2", timeout: 30000 } // Aumentato timeout e ritorno a networkidle2
    );

    // Aggiungi un piccolo delay per assicurarsi che tutto sia renderizzato

    // Debug: controlla cosa c'è sulla pagina
    const pageContent = await page.evaluate(() => {
      const cols = document.querySelectorAll(".fc-content-col");
      console.log('Found columns:', cols.length);

      return Array.from(cols).map((col, dayIndex) => {
        const events = Array.from(col.querySelectorAll(".fc-event"));
        console.log(`Day ${dayIndex}: ${events.length} events`);

        const parsedEvents = events.map(card => {
          const time = card.querySelector(".fc-time")?.textContent?.trim() ?? "";
          const title = card.querySelector(".fc-title")?.textContent?.trim() ?? "";
          console.log(`Event - Time: ${time}, Title: ${title}`);
          return { time, title };
        }).filter(event => event.title.includes("Var"));

        return { day: dayIndex, events: parsedEvents };
      });
    });

    console.log('Page content scraped:', JSON.stringify(pageContent, null, 2));

    // Salva in cache solo se abbiamo dati
    if (pageContent.some(day => day.events.length > 0)) {
      cachedData = {
        data: pageContent,
        timestamp: Date.now()
      };
    } else {
      console.warn('No events found on page! Not caching empty data.');
    }

    return pageContent;
  } finally {
    await browser.close();
  }
};

// Utility per trovare la prossima lezione
const findNextLesson = (lessons: { time: string; title: string }[], currentTime: Date, isToday: boolean) => {
  // Se non è oggi, non cerchiamo la "prossima" lezione basata sull'ora
  if (!isToday) {
    return null;
  }

  const now = currentTime.getHours() * 60 + currentTime.getMinutes();

  const parsedLessons = lessons.map(lesson => {
    const timeRange = lesson.time.split(' - ');
    if (timeRange.length !== 2) return null;

    const [startHour, startMin] = timeRange[0].split(':').map(Number);
    const [endHour, endMin] = timeRange[1].split(':').map(Number);

    return {
      ...lesson,
      startMinutes: startHour * 60 + startMin,
      endMinutes: endHour * 60 + endMin,
    };
  }).filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null);

  // Trova la lezione in corso
  const currentLesson = parsedLessons.find(lesson =>
    lesson && now >= lesson.startMinutes && now <= lesson.endMinutes
  );

  if (currentLesson) {
    return { lesson: currentLesson, status: 'current' as const };
  }

  // Trova la prossima lezione
  const nextLesson = parsedLessons
    .filter(lesson => lesson && lesson.startMinutes > now)
    .sort((a, b) => a.startMinutes - b.startMinutes)[0];

  if (nextLesson) {
    return { lesson: nextLesson, status: 'next' as const };
  }

  return null;
};

export const orarioRouter = createTRPCRouter({
  getOrario: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async () => {
      return await scrap();
    }),

  getNextLesson: publicProcedure
    .input(z.object({
      dayOffset: z.number().default(0) // 0 = oggi, 1 = domani, etc.
    }))
    .query(async ({ input }) => {
      const orarioData = await scrap();

      // Debug log
      console.log('Scraped data:', JSON.stringify(orarioData, null, 2));

      const currentDate = new Date();
      const targetDate = new Date(currentDate);
      targetDate.setDate(currentDate.getDate() + input.dayOffset);

      const dayOfWeek = targetDate.getDay(); // 0 = domenica, 1 = lunedì, etc.
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Converti per array 0-based lunedì-domenica

      console.log('Day of week:', dayOfWeek, 'Adjusted day:', adjustedDay, 'DayOffset:', input.dayOffset);

      const daySchedule = orarioData.find((day: { day: number; events: Array<{ time: string; title: string }> }) => day.day === adjustedDay);

      console.log('Day schedule found:', daySchedule);

      if (!daySchedule || daySchedule.events.length === 0) {
        return {
          hasLessons: false,
          dayName: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'][adjustedDay],
          date: targetDate.toISOString().split('T')[0],
          lessons: [],
        };
      }

      // Solo per oggi cerchiamo la prossima lezione
      const isToday = input.dayOffset === 0;
      const nextLessonInfo = findNextLesson(daySchedule.events, currentDate, isToday);

      return {
        hasLessons: true,
        dayName: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'][adjustedDay],
        date: targetDate.toISOString().split('T')[0],
        lessons: daySchedule.events,
        nextLesson: nextLessonInfo,
        totalLessons: daySchedule.events.length,
      };
    }),
});

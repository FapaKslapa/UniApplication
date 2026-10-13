import { DateTime } from "luxon";
import { lessonEnd, lessonStart } from "@/lib/agenda/lessons";
import { formatSubjectName } from "@/lib/agenda/subjectName";

const ZONE = "Europe/Rome";
const STAMP = "yyyyLLdd'T'HHmmss'Z'";

export type IcsLesson = {
  materia: string;
  time: string;
  aula: string;
  docente: string;
  date: DateTime;
};

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, ";")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldLine(line: string): string {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    chunks.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  chunks.push(rest);
  return chunks.join("\r\n");
}

function toUtc(date: DateTime, clock: string): DateTime | null {
  const [hour, minute] = clock.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  const local = DateTime.fromObject(
    { year: date.year, month: date.month, day: date.day, hour, minute },
    { zone: ZONE },
  );
  return local.isValid ? local.toUTC() : null;
}

export function lessonFilename(materia: string, date: DateTime): string {
  const slug = formatSubjectName(materia)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "lezione"}-${date.toFormat("yyyy-LL-dd")}.ics`;
}

function buildLessonVEvent(lesson: IcsLesson): string[] | null {
  const startClock = lessonStart(lesson.time);
  const endClock = lessonEnd(lesson.time);
  const start = toUtc(lesson.date, startClock);
  const end = endClock ? toUtc(lesson.date, endClock) : null;
  if (!start || !end) return null;
  const subject = formatSubjectName(lesson.materia);
  const uid = `${start.toFormat("yyyyLLddHHmm")}-${escapeText(subject).replace(/\s+/g, "-")}@uniorario`;
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${DateTime.utc().toFormat(STAMP)}`,
    `DTSTART:${start.toFormat(STAMP)}`,
    `DTEND:${end.toFormat(STAMP)}`,
    `SUMMARY:${escapeText(subject)}`,
  ];
  if (lesson.aula) lines.push(`LOCATION:${escapeText(lesson.aula)}`);
  if (lesson.docente) {
    lines.push(`DESCRIPTION:${escapeText(`Docente: ${lesson.docente}`)}`);
  }
  lines.push("END:VEVENT");
  return lines;
}

export function buildIcs(lessons: IcsLesson[]): string | null {
  const events = lessons
    .map(buildLessonVEvent)
    .filter((lines): lines is string[] => lines !== null);
  if (events.length === 0) return null;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UniOrario//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.flat(),
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export function downloadIcs(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

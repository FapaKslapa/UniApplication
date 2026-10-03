export const EXAM_REG_OPENS_DAYS_BEFORE = 30;
export const EXAM_REG_CLOSES_DAYS_BEFORE = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

export function defaultRegistrationWindow(startsAt: Date) {
  return {
    regOpensAt: new Date(
      startsAt.getTime() - EXAM_REG_OPENS_DAYS_BEFORE * DAY_MS,
    ),
    regClosesAt: new Date(
      startsAt.getTime() - EXAM_REG_CLOSES_DAYS_BEFORE * DAY_MS,
    ),
  };
}

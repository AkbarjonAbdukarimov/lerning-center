/** Helpers for working with calendar dates and months (server local time, see TZ env). */

export const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
export const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const pad = (n: number) => String(n).padStart(2, '0');

/** Today as YYYY-MM-DD. */
export function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Current month as YYYY-MM. */
export function currentMonth(now = new Date()): string {
  return todayIso(now).slice(0, 7);
}

/**
 * Half-open date range [start, end) for a YYYY-MM month,
 * e.g. 2024-12 -> { start: '2024-12-01', end: '2025-01-01' }.
 */
export function monthRange(month: string): { start: string; end: string } {
  if (!MONTH_REGEX.test(month)) {
    throw new Error(`Invalid month "${month}", expected YYYY-MM`);
  }
  const [year, m] = month.split('-').map(Number);
  const nextYear = m === 12 ? year + 1 : year;
  const nextMonth = m === 12 ? 1 : m + 1;
  return { start: `${month}-01`, end: `${nextYear}-${pad(nextMonth)}-01` };
}

/** Checks that a YYYY-MM-DD string is a real calendar date (rejects 2024-02-30). */
export function isValidIsoDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return d.toISOString().slice(0, 10) === value;
}

/** Converts a Prisma @db.Date value back to YYYY-MM-DD. */
export function dateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

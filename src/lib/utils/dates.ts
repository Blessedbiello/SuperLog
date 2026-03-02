import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isToday as dateFnsIsToday,
  differenceInCalendarDays,
} from "date-fns";

/**
 * Return the Monday of the week containing `date`.
 * Uses ISO week convention (Monday = first day of week).
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Return the Sunday of the week containing `date`.
 * Uses ISO week convention (Monday = first day, Sunday = last day).
 */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Return midnight on the first day of the month containing `date`.
 */
export function getMonthStart(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Return 23:59:59.999 on the last day of the month containing `date`.
 */
export function getMonthEnd(date: Date): Date {
  return endOfMonth(date);
}

/**
 * Format a date for display using the "MMM d, yyyy" pattern (e.g. "Jan 5, 2025").
 *
 * @param date   - The date to format.
 * @param pattern - Optional custom date-fns format string.
 */
export function formatDate(date: Date, pattern: string = "MMM d, yyyy"): string {
  return format(date, pattern);
}

/**
 * Return `true` if `date` falls on today's calendar day.
 */
export function isToday(date: Date): boolean {
  return dateFnsIsToday(date);
}

/**
 * Return the number of calendar days between `start` and `end`.
 * A positive result means `end` is after `start`.
 *
 * @example
 * getDaysBetween(new Date("2025-01-01"), new Date("2025-01-08")) // 7
 */
export function getDaysBetween(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start);
}

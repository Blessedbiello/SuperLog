import type { CalendarEventType, CalendarEventStatus } from "@prisma/client";

// ─── Event color map ─────────────────────────────────────────────────────────

const EVENT_COLORS: Record<CalendarEventType, { bg: string; border: string; text: string }> = {
  FOCUS_BLOCK:      { bg: "#10b981", border: "#059669", text: "#ffffff" },
  COMMUNITY_EVENT:  { bg: "#8b5cf6", border: "#7c3aed", text: "#ffffff" },
  HACKATHON:        { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
  CONTENT_PUBLISH:  { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
  LEARNING:         { bg: "#06b6d4", border: "#0891b2", text: "#ffffff" },
  COLLABORATION:    { bg: "#ec4899", border: "#db2777", text: "#ffffff" },
  PERSONAL:         { bg: "#6b7280", border: "#4b5563", text: "#ffffff" },
};

export function getEventColor(type: CalendarEventType) {
  return EVENT_COLORS[type] ?? EVENT_COLORS.PERSONAL;
}

// ─── Status opacity ───────────────────────────────────────────────────────────

export function getStatusOpacity(status: CalendarEventStatus): string {
  switch (status) {
    case "COMPLETED": return "opacity-100";
    case "PARTIAL":   return "opacity-70";
    case "MISSED":    return "opacity-40";
    case "SCHEDULED": return "opacity-90";
    default:          return "opacity-90";
  }
}

// ─── Event grouping by day ────────────────────────────────────────────────────

export interface CalendarEventLike {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  [key: string]: unknown;
}

/**
 * Groups an array of events by their local calendar date (YYYY-MM-DD).
 */
export function getEventsByDay<T extends CalendarEventLike>(
  events: T[],
): Record<string, T[]> {
  return events.reduce<Record<string, T[]>>((acc, event) => {
    const date = new Date(event.startTime);
    const key = toLocalDateKey(date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
}

/** Returns a YYYY-MM-DD string in local time for a given Date. */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Overlap detection ────────────────────────────────────────────────────────

/**
 * Returns true if two events overlap in time (exclusive at boundaries).
 */
export function isOverlapping(
  a: { startTime: Date | string; endTime: Date | string },
  b: { startTime: Date | string; endTime: Date | string },
): boolean {
  const aStart = new Date(a.startTime).getTime();
  const aEnd   = new Date(a.endTime).getTime();
  const bStart = new Date(b.startTime).getTime();
  const bEnd   = new Date(b.endTime).getTime();
  return aStart < bEnd && bStart < aEnd;
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

/** Returns the Monday of the ISO week containing `date`. */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Shift Sunday (0) to 7 so Monday (1) is the week start
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns the Sunday of the ISO week containing `date`. */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Returns the first day of the month containing `date`. */
export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/** Returns the last day of the month containing `date`. */
export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ─── Label helpers ────────────────────────────────────────────────────────────

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  FOCUS_BLOCK:     "Focus Block",
  COMMUNITY_EVENT: "Community Event",
  HACKATHON:       "Hackathon",
  CONTENT_PUBLISH: "Content Publish",
  LEARNING:        "Learning",
  COLLABORATION:   "Collaboration",
  PERSONAL:        "Personal",
};

export const EVENT_STATUS_LABELS: Record<CalendarEventStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  PARTIAL:   "Partial",
  MISSED:    "Missed",
};

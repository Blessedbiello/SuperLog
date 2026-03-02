import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar/calendar-view";
import { FocusBlock } from "@/components/calendar/focus-block";
import { getMonthStart, getMonthEnd } from "@/lib/calendar/utils";

export const metadata = { title: "Calendar | SuperLog" };

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Load events for the current month (client will re-fetch on navigation)
  const monthStart = getMonthStart();
  // Extend range slightly to cover week-view overflow at month boundaries
  const paddedStart = new Date(monthStart);
  paddedStart.setDate(paddedStart.getDate() - 7);

  const monthEnd = getMonthEnd();
  const paddedEnd = new Date(monthEnd);
  paddedEnd.setDate(paddedEnd.getDate() + 7);

  const [events, goals, projects] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: { gte: paddedStart },
        endTime:   { lte: paddedEnd },
      },
      include: {
        goal:    { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.goal.findMany({
      where:   { userId },
      select:  { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where:   { userId },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize dates to ISO strings for the client boundary
  const serializedEvents = events.map((ev) => ({
    ...ev,
    startTime: ev.startTime.toISOString(),
    endTime:   ev.endTime.toISOString(),
    createdAt: ev.createdAt.toISOString(),
    updatedAt: ev.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
          <CalendarDays className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500">
            Plan your time blocks, events, and focus sessions.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        {/* Main calendar */}
        <CalendarView
          initialEvents={serializedEvents}
          goals={goals}
          projects={projects}
        />

        {/* Sidebar: quick focus block widget */}
        <aside className="space-y-6">
          <FocusBlock goals={goals} />
        </aside>
      </div>
    </div>
  );
}

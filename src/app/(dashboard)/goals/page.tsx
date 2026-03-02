import { redirect } from "next/navigation";
import Link from "next/link";
import { Target, BarChart3 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { WeeklyPlanner } from "@/components/goals/weekly-planner";
import { GoalList } from "@/components/goals/goal-list";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getWeekStart, getWeekEnd } from "@/lib/calendar/utils";

export const metadata = { title: "Goals | SuperLog" };

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId    = session.user.id;
  const weekStart = getWeekStart();
  const weekEnd   = getWeekEnd();

  // Previous week for carry-over goals
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekEnd);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

  const [currentGoals, carriedGoals, calendarEvents, projects, keyResults, weeklyReport] =
    await Promise.all([
      // This week's goals
      prisma.goal.findMany({
        where: {
          userId,
          type: "WEEKLY",
          targetDate: { gte: weekStart, lte: weekEnd },
        },
        include: {
          project:   { select: { id: true, name: true } },
          keyResult: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "asc" },
      }),

      // Goals from last week that were not completed (carry-over candidates)
      prisma.goal.findMany({
        where: {
          userId,
          type:   "WEEKLY",
          status: { in: ["PLANNED", "IN_PROGRESS", "CARRIED_OVER"] },
          targetDate: { gte: prevWeekStart, lte: prevWeekEnd },
        },
        include: {
          project:   { select: { id: true, name: true } },
          keyResult: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "asc" },
      }),

      // Calendar events for this week
      prisma.calendarEvent.findMany({
        where: {
          userId,
          startTime: { gte: weekStart },
          endTime:   { lte: weekEnd },
        },
        select: {
          id:        true,
          title:     true,
          type:      true,
          startTime: true,
          endTime:   true,
        },
        orderBy: { startTime: "asc" },
      }),

      prisma.project.findMany({
        where:   { userId },
        select:  { id: true, name: true },
        orderBy: { name: "asc" },
      }),

      prisma.keyResult.findMany({
        where: { objective: { userId } },
        select: {
          id:    true,
          title: true,
          objective: { select: { title: true } },
        },
      }),

      // Planned score for this week
      prisma.weeklyReport.findUnique({
        where: { userId_weekStart: { userId, weekStart } },
        select: { plannedScore: true },
      }),
    ]);

  // Serialize dates
  const serializedCurrentGoals = currentGoals.map((g) => ({
    ...g,
    targetDate: g.targetDate?.toISOString() ?? null,
    createdAt:  g.createdAt.toISOString(),
    updatedAt:  g.updatedAt.toISOString(),
  }));

  const serializedCarriedGoals = carriedGoals.map((g) => ({
    ...g,
    targetDate: g.targetDate?.toISOString() ?? null,
    createdAt:  g.createdAt.toISOString(),
    updatedAt:  g.updatedAt.toISOString(),
  }));

  const serializedEvents = calendarEvents.map((ev) => ({
    ...ev,
    startTime: ev.startTime.toISOString(),
    endTime:   ev.endTime.toISOString(),
  }));

  const serializedKrs = keyResults.map((kr) => ({
    id:             kr.id,
    title:          kr.title,
    objectiveTitle: kr.objective.title,
  }));

  // Group current goals by project
  const byProject: Record<string, typeof serializedCurrentGoals> = {};
  for (const goal of serializedCurrentGoals) {
    const key = goal.project?.name ?? "No Project";
    if (!byProject[key]) byProject[key] = [];
    byProject[key].push(goal);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Target className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Weekly Goals</h1>
            <p className="text-sm text-slate-500">
              {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              {" – "}
              {weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <Button variant="outline" size="md" asChild>
          <Link href="/goals/monthly">
            <BarChart3 className="h-4 w-4" />
            Monthly OKRs
          </Link>
        </Button>
      </div>

      {/* Weekly planner (goals + mini calendar) */}
      <WeeklyPlanner
        weekGoals={serializedCurrentGoals}
        calendarEvents={serializedEvents}
        plannedScore={weeklyReport?.plannedScore ?? null}
        projects={projects}
        keyResults={serializedKrs}
        weekStart={weekStart}
      />

      {/* Carry-over goals from last week */}
      {serializedCarriedGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-amber-700">
              Carry-over from Last Week
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              These goals weren&apos;t completed last week. Consider picking them up.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <GoalList
              goals={serializedCarriedGoals}
              projects={projects}
              keyResults={serializedKrs}
            />
          </CardContent>
        </Card>
      )}

      {/* Goals grouped by project (if multiple projects exist) */}
      {Object.keys(byProject).length > 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">By Project</h2>
          {Object.entries(byProject).map(([projectName, projectGoals]) => (
            <Card key={projectName}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{projectName}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <GoalList
                  goals={projectGoals}
                  showProject={false}
                  projects={projects}
                  keyResults={serializedKrs}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

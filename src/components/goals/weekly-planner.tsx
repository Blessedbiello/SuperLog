"use client";

import { useState } from "react";
import { Plus, Target, CalendarDays, TrendingUp, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GoalForm, type GoalData } from "@/components/goals/goal-form";
import { GoalList, type GoalItem } from "@/components/goals/goal-list";
import { getWeekStart, getWeekEnd, toLocalDateKey } from "@/lib/calendar/utils";
import type { GoalStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeeklyCalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: string;
}

interface ProjectOption { id: string; name: string; }
interface KeyResultOption { id: string; title: string; objectiveTitle?: string; }

interface WeeklyPlannerProps {
  weekGoals: GoalItem[];
  calendarEvents?: WeeklyCalendarEvent[];
  plannedScore?: number | null;
  projects?: ProjectOption[];
  keyResults?: KeyResultOption[];
  weekStart?: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_COLORS: Record<GoalStatus, string> = {
  PLANNED:     "bg-slate-200",
  IN_PROGRESS: "bg-blue-400",
  COMPLETED:   "bg-emerald-500",
  MISSED:      "bg-red-400",
  CARRIED_OVER:"bg-amber-400",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  FOCUS_BLOCK:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMMUNITY_EVENT: "bg-purple-100 text-purple-700 border-purple-200",
  HACKATHON:       "bg-amber-100 text-amber-700 border-amber-200",
  CONTENT_PUBLISH: "bg-blue-100 text-blue-700 border-blue-200",
  LEARNING:        "bg-cyan-100 text-cyan-700 border-cyan-200",
  COLLABORATION:   "bg-pink-100 text-pink-700 border-pink-200",
  PERSONAL:        "bg-slate-100 text-slate-700 border-slate-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function WeeklyPlanner({
  weekGoals: initialGoals,
  calendarEvents = [],
  plannedScore: initialPlannedScore,
  projects = [],
  keyResults = [],
  weekStart = getWeekStart(),
}: WeeklyPlannerProps) {
  const [goals, setGoals]               = useState<GoalItem[]>(initialGoals);
  const [formOpen, setFormOpen]         = useState(false);
  const [plannedScore, setPlannedScore] = useState<string>(
    initialPlannedScore != null ? String(initialPlannedScore) : "",
  );
  const [scoreSaved, setScoreSaved]     = useState(false);
  const [scoreSaving, setScoreSaving]   = useState(false);

  const weekEnd   = getWeekEnd(weekStart);

  const completed  = goals.filter((g) => g.status === "COMPLETED").length;
  const total      = goals.length;
  const progress   = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Weekly mini calendar (Mon–Sun)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Group events by day key
  const eventsByDay = calendarEvents.reduce<Record<string, WeeklyCalendarEvent[]>>(
    (acc, ev) => {
      const key = toLocalDateKey(new Date(ev.startTime));
      if (!acc[key]) acc[key] = [];
      acc[key].push(ev);
      return acc;
    },
    {},
  );

  // Save planned score to weekly report
  async function saveScore() {
    const score = parseFloat(plannedScore);
    if (isNaN(score) || score < 0 || score > 100) return;

    setScoreSaving(true);
    try {
      await fetch("/api/weekly-report", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
          weekEnd:   weekEnd.toISOString(),
          plannedScore: score,
        }),
      });
      setScoreSaved(true);
      setTimeout(() => setScoreSaved(false), 2000);
    } finally {
      setScoreSaving(false);
    }
  }

  function handleGoalSaved(saved: GoalData) {
    setGoals((prev) => {
      const exists = prev.find((g) => g.id === saved.id);
      return exists
        ? prev.map((g) => (g.id === saved.id ? { ...g, ...saved } as GoalItem : g))
        : [...prev, saved as GoalItem];
    });
  }

  const weekLabel = weekStart.toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
  }) + " – " + weekEnd.toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
    year:  "numeric",
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      {/* Left: Goals */}
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <Target className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <CardTitle className="text-base">Weekly Goals</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">{weekLabel}</p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add Goal
              </Button>
            </div>

            {/* Progress bar */}
            {total > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>{completed}/{total} completed</span>
                  <span className="font-medium text-slate-700">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Status breakdown */}
                <div className="flex gap-1 mt-2">
                  {goals.map((g) => (
                    <div
                      key={g.id}
                      title={g.title}
                      className={clsx(
                        "h-1.5 flex-1 rounded-full",
                        STATUS_COLORS[g.status],
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-4">
            {/* Goal slots hint when under 3 goals */}
            {total < 3 && (
              <p className="mb-3 text-xs text-slate-400 italic">
                Aim for 3–5 goals this week to stay focused.
              </p>
            )}

            <GoalList
              goals={goals}
              onGoalsChange={setGoals}
              projects={projects}
              keyResults={keyResults}
              emptyMessage="No weekly goals set. Add your first goal above."
            />
          </CardContent>
        </Card>

        {/* Planned score */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-sm">Expected Weekly Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end gap-3">
              <Input
                label="Score (0–100)"
                type="number"
                min="0"
                max="100"
                value={plannedScore}
                onChange={(e) => setPlannedScore(e.target.value)}
                placeholder="e.g. 80"
                className="max-w-[160px]"
              />
              <Button
                variant="outline"
                size="md"
                onClick={saveScore}
                loading={scoreSaving}
                className="mb-0.5"
              >
                {scoreSaved ? "Saved!" : "Save"}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Predict your performance to track planning accuracy.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right: Week mini calendar */}
      <aside>
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-sm">This Week</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-1.5">
            {weekDays.map((day, idx) => {
              const key    = toLocalDateKey(day);
              const dayEvs = eventsByDay[key] ?? [];
              const isToday =
                toLocalDateKey(day) === toLocalDateKey(new Date());

              return (
                <div
                  key={key}
                  className={clsx(
                    "rounded-lg p-2.5 transition-colors",
                    isToday
                      ? "bg-emerald-50 border border-emerald-200"
                      : "border border-transparent hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={clsx(
                        "text-xs font-semibold",
                        isToday ? "text-emerald-700" : "text-slate-600",
                      )}
                    >
                      {DAYS[idx]}{" "}
                      <span className="font-normal text-slate-400">
                        {day.getDate()}
                      </span>
                    </span>
                    {dayEvs.length > 0 && (
                      <Badge variant="default" size="sm">
                        {dayEvs.length}
                      </Badge>
                    )}
                  </div>

                  {dayEvs.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className={clsx(
                        "mt-1.5 flex items-center gap-1.5 rounded border px-2 py-1 text-xs",
                        EVENT_TYPE_COLORS[ev.type] ?? "bg-slate-100 text-slate-700 border-slate-200",
                      )}
                    >
                      <span className="font-medium truncate flex-1">{ev.title}</span>
                      <span className="shrink-0 text-[10px] opacity-70">
                        {formatTime(ev.startTime)}
                      </span>
                    </div>
                  ))}

                  {dayEvs.length > 3 && (
                    <p className="mt-1 text-[10px] text-slate-400 flex items-center gap-0.5">
                      <ChevronRight className="h-3 w-3" />
                      {dayEvs.length - 3} more
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </aside>

      <GoalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleGoalSaved}
        initialData={{
          type:       "WEEKLY",
          targetDate: weekEnd.toISOString(),
        }}
        projects={projects}
        keyResults={keyResults}
      />
    </div>
  );
}

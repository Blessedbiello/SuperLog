"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle, RotateCcw, Pencil, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoalForm, type GoalData } from "@/components/goals/goal-form";
import type { GoalStatus, GoalType } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GoalItem {
  id: string;
  title: string;
  description?: string | null;
  type: GoalType;
  status: GoalStatus;
  targetDate?: string | null;
  projectId?: string | null;
  keyResultId?: string | null;
  project?: { id: string; name: string } | null;
  keyResult?: { id: string; title: string } | null;
}

interface ProjectOption { id: string; name: string; }
interface KeyResultOption { id: string; title: string; objectiveTitle?: string; }

interface GoalListProps {
  goals: GoalItem[];
  showProject?: boolean;
  onGoalsChange?: (goals: GoalItem[]) => void;
  projects?: ProjectOption[];
  keyResults?: KeyResultOption[];
  emptyMessage?: string;
}

// ─── Status cycle ─────────────────────────────────────────────────────────────

const STATUS_CYCLE: GoalStatus[] = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
];

function nextStatus(current: GoalStatus): GoalStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  if (idx === -1) return "PLANNED";
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// ─── Status presentation ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  GoalStatus,
  { icon: React.FC<{ className?: string }>; badgeVariant: "default" | "success" | "warning" | "danger" | "info"; label: string }
> = {
  PLANNED:     { icon: Circle,       badgeVariant: "default",  label: "Planned" },
  IN_PROGRESS: { icon: Clock,        badgeVariant: "info",     label: "In Progress" },
  COMPLETED:   { icon: CheckCircle2, badgeVariant: "success",  label: "Completed" },
  MISSED:      { icon: AlertCircle,  badgeVariant: "danger",   label: "Missed" },
  CARRIED_OVER:{ icon: RotateCcw,    badgeVariant: "warning",  label: "Carried Over" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GoalList({
  goals: initialGoals,
  showProject = true,
  onGoalsChange,
  projects = [],
  keyResults = [],
  emptyMessage = "No goals yet.",
}: GoalListProps) {
  const [goals, setGoals]       = useState<GoalItem[]>(initialGoals);
  const [editGoal, setEditGoal] = useState<GoalItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function updateGoals(updated: GoalItem[]) {
    setGoals(updated);
    onGoalsChange?.(updated);
  }

  // ── Toggle status ──────────────────────────────────────────────────────────
  async function handleToggleStatus(goal: GoalItem) {
    if (["MISSED", "CARRIED_OVER"].includes(goal.status)) return;
    const next = nextStatus(goal.status);
    setToggling(goal.id);
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        updateGoals(goals.map((g) => (g.id === goal.id ? { ...g, status: next } : g)));
      }
    } finally {
      setToggling(null);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) {
        updateGoals(goals.filter((g) => g.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  // ── Form save ──────────────────────────────────────────────────────────────
  function handleSaved(saved: GoalData) {
    const updated = goals.find((g) => g.id === saved.id)
      ? goals.map((g) => (g.id === saved.id ? { ...g, ...saved } : g))
      : [...goals, saved as GoalItem];
    updateGoals(updated);
  }

  if (goals.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">{emptyMessage}</p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {goals.map((goal) => {
          const cfg = STATUS_CONFIG[goal.status];
          const StatusIcon = cfg.icon;
          const isCompleted = goal.status === "COMPLETED";
          const isTogglable = !["MISSED", "CARRIED_OVER"].includes(goal.status);

          return (
            <li
              key={goal.id}
              className={clsx(
                "group flex items-start gap-3 rounded-xl border p-3.5 transition-all",
                isCompleted
                  ? "border-emerald-100 bg-emerald-50/40"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              {/* Status toggle button */}
              <button
                type="button"
                disabled={!isTogglable || toggling === goal.id}
                onClick={() => handleToggleStatus(goal)}
                className={clsx(
                  "mt-0.5 shrink-0 transition-colors",
                  isTogglable ? "cursor-pointer hover:opacity-75" : "cursor-default",
                  toggling === goal.id && "animate-pulse",
                  isCompleted ? "text-emerald-600" : "text-slate-400",
                )}
                title={isTogglable ? `Mark as ${nextStatus(goal.status).toLowerCase().replace("_", " ")}` : undefined}
              >
                <StatusIcon className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={clsx(
                      "text-sm font-medium leading-tight",
                      isCompleted ? "line-through text-slate-400" : "text-slate-800",
                    )}
                  >
                    {goal.title}
                  </span>
                  <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                  {goal.status === "CARRIED_OVER" && (
                    <Badge variant="warning">Carried Over</Badge>
                  )}
                </div>

                {goal.description && (
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                    {goal.description}
                  </p>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {showProject && goal.project && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                      {goal.project.name}
                    </span>
                  )}
                  {goal.keyResult && (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      KR: {goal.keyResult.title}
                    </span>
                  )}
                  {goal.targetDate && (
                    <span>
                      Due{" "}
                      {new Date(goal.targetDate).toLocaleDateString("en-US", {
                        month: "short",
                        day:   "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => { setEditGoal(goal); setFormOpen(true); }}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Edit goal"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={deleting === goal.id}
                  onClick={() => handleDelete(goal.id)}
                  className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                  title="Delete goal"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <GoalForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditGoal(null); }}
        onSaved={handleSaved}
        initialData={editGoal}
        projects={projects}
        keyResults={keyResults}
      />
    </>
  );
}

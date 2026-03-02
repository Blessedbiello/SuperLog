"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Target, CheckCircle2, Circle, Plus } from "lucide-react";
import { clsx } from "clsx";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface Goal {
  id: string;
  title: string;
  status: string;
  type: string;
}

interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  goals: Goal[];
}

interface Objective {
  id: string;
  title: string;
  keyResults: KeyResult[];
}

interface OKRTreeProps {
  objectives: Objective[];
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  COMPLETED: CheckCircle2,
  IN_PROGRESS: Circle,
  PLANNED: Circle,
};

const statusColors: Record<string, string> = {
  COMPLETED: "text-emerald-500",
  IN_PROGRESS: "text-blue-500",
  PLANNED: "text-gray-400",
  MISSED: "text-red-400",
  CARRIED_OVER: "text-amber-500",
};

export function OKRTree({ objectives }: OKRTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(objectives.map((o) => [o.id, true]))
  );
  const [showNewObjective, setShowNewObjective] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const now = new Date();
      await fetch("/api/goals/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
      });
      setNewTitle("");
      setShowNewObjective(false);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {objectives.map((objective) => {
        const isExpanded = expanded[objective.id] ?? true;
        const totalProgress =
          objective.keyResults.length > 0
            ? objective.keyResults.reduce(
                (sum, kr) => sum + (kr.current / kr.target) * 100,
                0
              ) / objective.keyResults.length
            : 0;

        return (
          <Card key={objective.id}>
            <CardContent className="p-4">
              {/* Objective header */}
              <button
                onClick={() => toggle(objective.id)}
                className="flex w-full items-center gap-3 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                )}
                <Target className="h-5 w-5 shrink-0 text-emerald-500" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {objective.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-3">
                    <Progress
                      value={totalProgress}
                      size="sm"
                      showPercent={false}
                      className="w-32"
                    />
                    <span className="text-xs text-gray-500">
                      {Math.round(totalProgress)}% complete
                    </span>
                    <Badge variant="default">
                      {objective.keyResults.length} key results
                    </Badge>
                  </div>
                </div>
              </button>

              {/* Key Results */}
              {isExpanded && (
                <div className="mt-4 ml-10 space-y-3">
                  {objective.keyResults.map((kr) => {
                    const krPercent = Math.round((kr.current / kr.target) * 100);
                    return (
                      <div key={kr.id} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800">{kr.title}</p>
                          <span className="text-xs text-gray-500">
                            {kr.current}/{kr.target}
                          </span>
                        </div>
                        <Progress
                          value={krPercent}
                          size="sm"
                          showPercent={false}
                          color={krPercent >= 100 ? "emerald" : krPercent >= 50 ? "blue" : "amber"}
                          className="mt-2"
                        />

                        {/* Linked goals */}
                        {kr.goals.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {kr.goals.map((goal) => {
                              const Icon = statusIcons[goal.status] || Circle;
                              return (
                                <div key={goal.id} className="flex items-center gap-2 text-xs">
                                  <Icon
                                    className={clsx(
                                      "h-3.5 w-3.5",
                                      statusColors[goal.status] || "text-gray-400"
                                    )}
                                  />
                                  <span className="text-gray-600">{goal.title}</span>
                                  <Badge
                                    variant={goal.status === "COMPLETED" ? "success" : "default"}
                                    size="sm"
                                  >
                                    {goal.type.toLowerCase()}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add Objective */}
      <Button variant="outline" onClick={() => setShowNewObjective(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Objective
      </Button>

      <Modal
        open={showNewObjective}
        onClose={() => setShowNewObjective(false)}
        title="New Monthly Objective"
      >
        <form onSubmit={handleCreateObjective} className="space-y-4">
          <Input
            label="Objective Title"
            placeholder="e.g., Ship MVP of SuperLog"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setShowNewObjective(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

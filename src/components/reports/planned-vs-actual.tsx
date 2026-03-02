"use client";

import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GoalComparison {
  title: string;
  planned: string;
  actual: string;
}

interface PlannedVsActualProps {
  goals: GoalComparison[];
  accuracy: number | null;
}

const statusIcons: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  COMPLETED: { icon: CheckCircle2, color: "text-emerald-500" },
  MISSED: { icon: XCircle, color: "text-red-500" },
  IN_PROGRESS: { icon: Clock, color: "text-blue-500" },
  PLANNED: { icon: Clock, color: "text-gray-400" },
  CARRIED_OVER: { icon: ArrowRight, color: "text-amber-500" },
};

export function PlannedVsActual({ goals, accuracy }: PlannedVsActualProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Planned vs Actual</CardTitle>
          {accuracy !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Accuracy:</span>
              <span className={`text-lg font-bold ${accuracy >= 80 ? "text-emerald-600" : accuracy >= 50 ? "text-amber-600" : "text-red-600"}`}>
                {accuracy}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No goals to compare</p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, i) => {
              const planned = statusIcons[goal.planned] || statusIcons.PLANNED;
              const actual = statusIcons[goal.actual] || statusIcons.PLANNED;
              const PlannedIcon = planned.icon;
              const ActualIcon = actual.icon;

              return (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{goal.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <PlannedIcon className={`h-4 w-4 ${planned.color}`} />
                      <span className="text-gray-500">Planned</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                    <div className="flex items-center gap-1 text-xs">
                      <ActualIcon className={`h-4 w-4 ${actual.color}`} />
                      <span className="text-gray-500">{goal.actual.toLowerCase().replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Flame, Shield } from "lucide-react";

interface StreakWidgetProps {
  activityStreak: number;
  codeStreak: number;
  writingStreak: number;
  consistencyStreak: number;
  shields: number;
}

export function StreakWidget({
  activityStreak,
  codeStreak,
  writingStreak,
  consistencyStreak,
  shields,
}: StreakWidgetProps) {
  const streaks = [
    { label: "Activity", value: activityStreak, color: "text-orange-500" },
    { label: "Code", value: codeStreak, color: "text-blue-500" },
    { label: "Writing", value: writingStreak, color: "text-purple-500" },
    { label: "Consistency", value: consistencyStreak, color: "text-emerald-500" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="text-sm font-semibold text-gray-900">Streaks</h3>
        </div>
        {shields > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700">{shields}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {streaks.map((streak) => (
          <div key={streak.label} className="text-center">
            <p className={`text-2xl font-bold ${streak.color}`}>{streak.value}</p>
            <p className="text-xs text-gray-500">{streak.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

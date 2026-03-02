"use client";

import { Activity, GitCommit, FileText, Flame } from "lucide-react";

interface StatsCardsProps {
  weeklyScore: number;
  totalActivities: number;
  currentStreak: number;
  goalsCompleted: number;
  goalsTotal: number;
}

export function StatsCards({
  weeklyScore,
  totalActivities,
  currentStreak,
  goalsCompleted,
  goalsTotal,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Weekly Score",
      value: weeklyScore,
      suffix: "/100",
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Activities This Week",
      value: totalActivities,
      icon: GitCommit,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Current Streak",
      value: currentStreak,
      suffix: " days",
      icon: Flame,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Goals Completed",
      value: goalsCompleted,
      suffix: `/${goalsTotal}`,
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-gray-400">{stat.suffix}</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

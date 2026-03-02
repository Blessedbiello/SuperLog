"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { DailyFocus } from "@/components/dashboard/daily-focus";
import { StreakWidget } from "@/components/dashboard/streak-widget";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ContributionChart } from "@/components/dashboard/contribution-chart";
import { OnboardingChecklist } from "@/components/onboarding/checklist";
import type { OnboardingSteps } from "@/types";

interface DashboardClientProps {
  userName: string;
  weeklyScore: number;
  totalActivities: number;
  currentStreak: number;
  goalsCompleted: number;
  goalsTotal: number;
  activityStreak: number;
  codeStreak: number;
  writingStreak: number;
  consistencyStreak: number;
  shields: number;
  feedItems: {
    id: string;
    type: string;
    title: string;
    url?: string | null;
    repo?: string;
    createdAt: string;
    project?: { name: string } | null;
  }[];
  currentFocus: string | null;
  onboardingSteps: Record<string, boolean> | null;
  weeklyScores: { date: string; score: number }[];
}

export function DashboardClient({
  userName,
  weeklyScore,
  totalActivities,
  currentStreak,
  goalsCompleted,
  goalsTotal,
  activityStreak,
  codeStreak,
  writingStreak,
  consistencyStreak,
  shields,
  feedItems,
  currentFocus,
  onboardingSteps,
  weeklyScores,
}: DashboardClientProps) {
  const handleSaveFocus = async (focus: string) => {
    await fetch("/api/daily-focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Good {getTimeOfDay()}, {userName}
        </h2>
        <p className="text-sm text-gray-500">Here&apos;s your proof-of-work summary</p>
      </div>

      {/* Onboarding */}
      {onboardingSteps && (
        <OnboardingChecklist steps={onboardingSteps as OnboardingSteps} />
      )}

      {/* Stats */}
      <StatsCards
        weeklyScore={weeklyScore}
        totalActivities={totalActivities}
        currentStreak={currentStreak}
        goalsCompleted={goalsCompleted}
        goalsTotal={goalsTotal}
      />

      {/* Daily Focus */}
      <DailyFocus currentFocus={currentFocus} onSave={handleSaveFocus} />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed items={feedItems} />
          <ContributionChart data={weeklyScores} />
        </div>
        <div className="space-y-6">
          <StreakWidget
            activityStreak={activityStreak}
            codeStreak={codeStreak}
            writingStreak={writingStreak}
            consistencyStreak={consistencyStreak}
            shields={shields}
          />
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

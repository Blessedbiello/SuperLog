import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { startOfWeek, endOfWeek } from "date-fns";
import { DashboardClient } from "./client";
import type { OnboardingSteps } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const todayDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  const [
    githubActivities,
    tweets,
    blogPosts,
    goals,
    streaks,
    dailyFocus,
    weeklyReport,
    onboarding,
  ] = await Promise.all([
    prisma.gitHubActivity.findMany({
      where: { userId, occurredAt: { gte: weekStart, lte: weekEnd } },
      include: { project: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 20,
    }),
    prisma.tweet.findMany({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.blogPost.findMany({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.goal.findMany({
      where: { userId, type: "WEEKLY", targetDate: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.streak.findMany({ where: { userId } }),
    prisma.dailyFocus.findFirst({ where: { userId, date: todayDate } }),
    prisma.weeklyReport.findFirst({
      where: { userId, weekStart: weekStart },
    }),
    prisma.onboardingProgress.findFirst({ where: { userId } }),
  ]);

  // Build activity feed items
  const feedItems = [
    ...githubActivities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      url: a.url,
      repo: a.repo,
      createdAt: a.occurredAt.toISOString(),
      project: a.project,
    })),
    ...tweets.map((t) => ({
      id: t.id,
      type: "TWEET",
      title: t.content?.slice(0, 80) || "Tweet",
      url: t.url,
      createdAt: t.createdAt.toISOString(),
      project: null,
    })),
    ...blogPosts.map((b) => ({
      id: b.id,
      type: "BLOG",
      title: b.title,
      url: b.url,
      createdAt: b.createdAt.toISOString(),
      project: null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activityStreak = streaks.find((s) => s.type === "ACTIVITY");
  const codeStreak = streaks.find((s) => s.type === "CODE");
  const writingStreak = streaks.find((s) => s.type === "WRITING");
  const consistencyStreak = streaks.find((s) => s.type === "CONSISTENCY");
  const goalsCompleted = goals.filter((g) => g.status === "COMPLETED").length;

  const onboardingSteps = onboarding?.steps as OnboardingSteps | undefined;

  return (
    <DashboardClient
      userName={session.user.name || "there"}
      weeklyScore={weeklyReport?.score ?? 0}
      totalActivities={feedItems.length}
      currentStreak={activityStreak?.currentLength ?? 0}
      goalsCompleted={goalsCompleted}
      goalsTotal={goals.length}
      activityStreak={activityStreak?.currentLength ?? 0}
      codeStreak={codeStreak?.currentLength ?? 0}
      writingStreak={writingStreak?.currentLength ?? 0}
      consistencyStreak={consistencyStreak?.currentLength ?? 0}
      shields={activityStreak?.shieldsAvailable ?? 0}
      feedItems={feedItems}
      currentFocus={dailyFocus?.focus ?? null}
      onboardingSteps={onboardingSteps ?? null}
      weeklyScores={[]}
    />
  );
}

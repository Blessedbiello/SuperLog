import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { calculateDevScore } from "./scoring";
import { startOfWeek, endOfWeek } from "date-fns";

export async function generateWeeklyReport(userId: string, weekStartDate: Date) {
  const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStartDate, { weekStartsOn: 1 });

  const [scoreBreakdown, activities, tweets, blogs, goals] = await Promise.all([
    calculateDevScore(userId, weekStart, weekEnd),
    prisma.gitHubActivity.findMany({
      where: { userId, occurredAt: { gte: weekStart, lte: weekEnd } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.tweet.findMany({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.blogPost.findMany({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.goal.findMany({
      where: { userId, type: "WEEKLY", targetDate: { gte: weekStart, lte: weekEnd } },
    }),
  ]);

  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const planningAccuracy = goals.length > 0
    ? Math.round((completedGoals.length / goals.length) * 100)
    : null;

  const highlights = [
    activities.length > 0 && `${activities.length} GitHub activities`,
    tweets.length > 0 && `${tweets.length} tweets`,
    blogs.length > 0 && `${blogs.length} blog posts`,
    completedGoals.length > 0 && `${completedGoals.length}/${goals.length} goals completed`,
  ]
    .filter(Boolean)
    .join(" | ");

  const summary = {
    score: scoreBreakdown,
    activityCounts: {
      github: activities.length,
      tweets: tweets.length,
      blogs: blogs.length,
    },
    goals: {
      total: goals.length,
      completed: completedGoals.length,
      titles: goals.map((g) => ({ title: g.title, status: g.status })),
    },
  };
  const summaryJson = summary as unknown as Prisma.InputJsonValue;

  const report = await prisma.weeklyReport.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: {
      weekEnd,
      summary: summaryJson,
      highlights,
      score: scoreBreakdown.total,
      planningAccuracy,
    },
    create: {
      userId,
      weekStart,
      weekEnd,
      summary: summaryJson,
      highlights,
      score: scoreBreakdown.total,
      planningAccuracy,
    },
  });

  return report;
}

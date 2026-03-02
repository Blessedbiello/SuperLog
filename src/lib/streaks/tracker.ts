import { prisma } from "@/lib/prisma";
import { startOfDay, differenceInDays, startOfWeek, endOfWeek } from "date-fns";

export async function updateStreaks(userId: string) {
  const today = startOfDay(new Date());

  await Promise.all([
    updateActivityStreak(userId, today),
    updateCodeStreak(userId, today),
    updateWritingStreak(userId, today),
    updateConsistencyStreak(userId, today),
    updatePlanningStreak(userId, today),
  ]);
}

async function upsertStreak(
  userId: string,
  type: "ACTIVITY" | "CONSISTENCY" | "WRITING" | "CODE" | "PLANNING",
  lastActiveDate: Date,
  currentLength: number,
  longestLength: number
) {
  await prisma.streak.upsert({
    where: { userId_type: { userId, type } },
    update: { currentLength, longestLength: Math.max(longestLength, currentLength), lastActiveDate },
    create: { userId, type, currentLength, longestLength: currentLength, lastActiveDate },
  });
}

async function getStreak(userId: string, type: "ACTIVITY" | "CONSISTENCY" | "WRITING" | "CODE" | "PLANNING") {
  return prisma.streak.findUnique({ where: { userId_type: { userId, type } } });
}

async function updateActivityStreak(userId: string, today: Date) {
  const streak = await getStreak(userId, "ACTIVITY");
  const hasActivity = await hasActivityToday(userId, today);

  if (!hasActivity) return;

  const lastActive = streak?.lastActiveDate;
  const daysSinceLast = lastActive ? differenceInDays(today, lastActive) : 999;

  let newLength = 1;
  if (daysSinceLast === 1) {
    newLength = (streak?.currentLength || 0) + 1;
  } else if (daysSinceLast === 0) {
    newLength = streak?.currentLength || 1;
  } else if (daysSinceLast === 2 && streak && streak.shieldsAvailable > 0) {
    newLength = (streak.currentLength || 0) + 1;
    await prisma.streak.update({
      where: { userId_type: { userId, type: "ACTIVITY" } },
      data: { shieldsAvailable: { decrement: 1 } },
    });
  }

  await upsertStreak(userId, "ACTIVITY", today, newLength, streak?.longestLength || 0);
}

async function updateCodeStreak(userId: string, today: Date) {
  const streak = await getStreak(userId, "CODE");
  const commits = await prisma.gitHubActivity.count({
    where: {
      userId,
      type: "COMMIT",
      occurredAt: { gte: today, lt: new Date(today.getTime() + 86400000) },
    },
  });

  if (commits === 0) return;

  const lastActive = streak?.lastActiveDate;
  const daysSinceLast = lastActive ? differenceInDays(today, lastActive) : 999;
  const newLength = daysSinceLast === 1 ? (streak?.currentLength || 0) + 1 : daysSinceLast === 0 ? (streak?.currentLength || 1) : 1;

  await upsertStreak(userId, "CODE", today, newLength, streak?.longestLength || 0);
}

async function updateWritingStreak(userId: string, today: Date) {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const streak = await getStreak(userId, "WRITING");

  const contentCount = await prisma.tweet.count({
    where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
  }) + await prisma.blogPost.count({
    where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
  });

  if (contentCount === 0) return;

  const lastActive = streak?.lastActiveDate;
  const weeksSinceLast = lastActive ? Math.floor(differenceInDays(today, lastActive) / 7) : 999;
  const newLength = weeksSinceLast <= 1 ? (streak?.currentLength || 0) + 1 : 1;

  await upsertStreak(userId, "WRITING", today, newLength, streak?.longestLength || 0);
}

async function updateConsistencyStreak(userId: string, today: Date) {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const streak = await getStreak(userId, "CONSISTENCY");

  const report = await prisma.weeklyReport.findFirst({
    where: { userId, weekStart: { gte: weekStart, lte: weekEnd } },
  });

  if (!report || report.score < 50) return;

  const lastActive = streak?.lastActiveDate;
  const weeksSinceLast = lastActive ? Math.floor(differenceInDays(today, lastActive) / 7) : 999;
  const newLength = weeksSinceLast <= 1 ? (streak?.currentLength || 0) + 1 : 1;

  await upsertStreak(userId, "CONSISTENCY", today, newLength, streak?.longestLength || 0);
}

async function updatePlanningStreak(userId: string, today: Date) {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const streak = await getStreak(userId, "PLANNING");

  const goals = await prisma.goal.count({
    where: { userId, type: "WEEKLY", targetDate: { gte: weekStart, lte: weekEnd } },
  });
  const hasRetro = await prisma.weeklyReport.count({
    where: { userId, weekStart: { gte: weekStart, lte: weekEnd } },
  });

  if (goals === 0 || hasRetro === 0) return;

  const lastActive = streak?.lastActiveDate;
  const weeksSinceLast = lastActive ? Math.floor(differenceInDays(today, lastActive) / 7) : 999;
  const newLength = weeksSinceLast <= 1 ? (streak?.currentLength || 0) + 1 : 1;

  await upsertStreak(userId, "PLANNING", today, newLength, streak?.longestLength || 0);
}

async function hasActivityToday(userId: string, today: Date) {
  const tomorrow = new Date(today.getTime() + 86400000);
  const [github, tweets, blogs] = await Promise.all([
    prisma.gitHubActivity.count({ where: { userId, occurredAt: { gte: today, lt: tomorrow } } }),
    prisma.tweet.count({ where: { userId, createdAt: { gte: today, lt: tomorrow } } }),
    prisma.blogPost.count({ where: { userId, createdAt: { gte: today, lt: tomorrow } } }),
  ]);
  return github + tweets + blogs > 0;
}

export async function checkStreakShieldEligibility(userId: string) {
  const streaks = await prisma.streak.findMany({ where: { userId } });
  const activityStreak = streaks.find((s) => s.type === "ACTIVITY");

  if (activityStreak && activityStreak.currentLength >= 30 && activityStreak.currentLength % 30 === 0) {
    await prisma.streak.update({
      where: { userId_type: { userId, type: "ACTIVITY" } },
      data: { shieldsAvailable: { increment: 1 } },
    });
  }
}

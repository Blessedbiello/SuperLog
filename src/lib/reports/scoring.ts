import { prisma } from "@/lib/prisma";

interface ScoreBreakdown {
  commits: { count: number; points: number; cap: number };
  prs: { count: number; points: number; cap: number };
  issues: { count: number; points: number; cap: number };
  reviews: { count: number; points: number; cap: number };
  releases: { count: number; points: number; cap: number };
  tweets: { count: number; points: number; cap: number };
  blogs: { count: number; points: number; cap: number };
  planning: { completed: boolean; points: number; cap: number };
  retrospective: { completed: boolean; points: number; cap: number };
  total: number;
}

const DEV_RULES = {
  COMMIT: { points: 2, cap: 30 },
  PR: { points: 5, cap: 25 },
  ISSUE: { points: 3, cap: 15 },
  REVIEW: { points: 4, cap: 20 },
  RELEASE: { points: 10, cap: 10 },
  TWEET: { points: 3, cap: 15 },
  BLOG: { points: 8, cap: 16 },
  PLANNING: { points: 10, cap: 10 },
  RETRO: { points: 10, cap: 10 },
} as const;

export async function calculateDevScore(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<ScoreBreakdown> {
  const [githubActivities, tweets, blogs, goals] = await Promise.all([
    prisma.gitHubActivity.groupBy({
      by: ["type"],
      where: { userId, occurredAt: { gte: weekStart, lte: weekEnd } },
      _count: true,
    }),
    prisma.tweet.count({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.blogPost.count({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.goal.findMany({
      where: {
        userId,
        type: "WEEKLY",
        targetDate: { gte: weekStart, lte: weekEnd },
      },
    }),
  ]);

  const countByType: Record<string, number> = {};
  for (const g of githubActivities) {
    countByType[g.type] = g._count;
  }

  const calc = (count: number, rule: { points: number; cap: number }) =>
    Math.min(count * rule.points, rule.cap);

  const commitCount = countByType["COMMIT"] || 0;
  const prCount = countByType["PR"] || 0;
  const issueCount = countByType["ISSUE"] || 0;
  const reviewCount = countByType["REVIEW"] || 0;
  const releaseCount = countByType["RELEASE"] || 0;

  const hasPlanning = goals.length > 0;
  const hasRetro = goals.some((g) => g.status === "COMPLETED" || g.status === "MISSED");

  const breakdown: ScoreBreakdown = {
    commits: { count: commitCount, points: calc(commitCount, DEV_RULES.COMMIT), cap: DEV_RULES.COMMIT.cap },
    prs: { count: prCount, points: calc(prCount, DEV_RULES.PR), cap: DEV_RULES.PR.cap },
    issues: { count: issueCount, points: calc(issueCount, DEV_RULES.ISSUE), cap: DEV_RULES.ISSUE.cap },
    reviews: { count: reviewCount, points: calc(reviewCount, DEV_RULES.REVIEW), cap: DEV_RULES.REVIEW.cap },
    releases: { count: releaseCount, points: calc(releaseCount, DEV_RULES.RELEASE), cap: DEV_RULES.RELEASE.cap },
    tweets: { count: tweets, points: calc(tweets, DEV_RULES.TWEET), cap: DEV_RULES.TWEET.cap },
    blogs: { count: blogs, points: calc(blogs, DEV_RULES.BLOG), cap: DEV_RULES.BLOG.cap },
    planning: { completed: hasPlanning, points: hasPlanning ? DEV_RULES.PLANNING.points : 0, cap: DEV_RULES.PLANNING.cap },
    retrospective: { completed: hasRetro, points: hasRetro ? DEV_RULES.RETRO.points : 0, cap: DEV_RULES.RETRO.cap },
    total: 0,
  };

  breakdown.total = Math.min(
    100,
    breakdown.commits.points +
      breakdown.prs.points +
      breakdown.issues.points +
      breakdown.reviews.points +
      breakdown.releases.points +
      breakdown.tweets.points +
      breakdown.blogs.points +
      breakdown.planning.points +
      breakdown.retrospective.points
  );

  return breakdown;
}

export async function calculateWriterScore(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<{ consistency: number; quality: number; volume: number; planning: number; diversity: number; total: number }> {
  const [tweets, blogs, goals] = await Promise.all([
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

  const totalContent = tweets.length + blogs.length;

  // Consistency (30%): hit frequency goal
  const consistency = Math.min(totalContent >= 3 ? 30 : (totalContent / 3) * 30, 30);

  // Quality (20%): based on reactions (simplified - use count as proxy)
  const quality = Math.min(totalContent * 5, 20);

  // Volume (20%): pieces produced
  const volume = Math.min(totalContent * 4, 20);

  // Planning (15%): planned vs actual
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const planning = goals.length > 0
    ? Math.min((completedGoals / goals.length) * 15, 15)
    : 0;

  // Diversity (15%): different platforms/types
  const platforms = new Set(blogs.map((b) => b.platform).filter(Boolean));
  const hasTweets = tweets.length > 0;
  const diversityCount = platforms.size + (hasTweets ? 1 : 0);
  const diversity = Math.min(diversityCount * 5, 15);

  const total = Math.min(100, Math.round(consistency + quality + volume + planning + diversity));

  return { consistency, quality, volume, planning, diversity, total };
}

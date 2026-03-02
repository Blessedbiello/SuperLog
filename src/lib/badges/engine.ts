import { prisma } from "@/lib/prisma";

interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  category: string;
  check: (userId: string) => Promise<boolean>;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    name: "First Log",
    description: "Logged your first activity",
    icon: "zap",
    category: "milestone",
    check: async (userId) => {
      const count = await prisma.gitHubActivity.count({ where: { userId } });
      const tweets = await prisma.tweet.count({ where: { userId } });
      const blogs = await prisma.blogPost.count({ where: { userId } });
      return count + tweets + blogs >= 1;
    },
  },
  {
    name: "Week Warrior",
    description: "7-day activity streak",
    icon: "flame",
    category: "streak",
    check: async (userId) => {
      const streak = await prisma.streak.findUnique({ where: { userId_type: { userId, type: "ACTIVITY" } } });
      return (streak?.longestLength || 0) >= 7;
    },
  },
  {
    name: "Monthly Machine",
    description: "30-day activity streak",
    icon: "trophy",
    category: "streak",
    check: async (userId) => {
      const streak = await prisma.streak.findUnique({ where: { userId_type: { userId, type: "ACTIVITY" } } });
      return (streak?.longestLength || 0) >= 30;
    },
  },
  {
    name: "Perfect Week",
    description: "Scored 100 in a weekly report",
    icon: "star",
    category: "score",
    check: async (userId) => {
      const report = await prisma.weeklyReport.findFirst({ where: { userId, score: { gte: 100 } } });
      return !!report;
    },
  },
  {
    name: "Project Pro",
    description: "Created 10 projects",
    icon: "folder",
    category: "milestone",
    check: async (userId) => {
      const count = await prisma.project.count({ where: { userId } });
      return count >= 10;
    },
  },
  {
    name: "Centurion",
    description: "100 GitHub commits tracked",
    icon: "git-commit",
    category: "milestone",
    check: async (userId) => {
      const count = await prisma.gitHubActivity.count({ where: { userId, type: "COMMIT" } });
      return count >= 100;
    },
  },
  {
    name: "Open Source Hero",
    description: "Merged 10 pull requests",
    icon: "git-pull-request",
    category: "milestone",
    check: async (userId) => {
      const count = await prisma.gitHubActivity.count({ where: { userId, type: "PR" } });
      return count >= 10;
    },
  },
  {
    name: "Wordsmith",
    description: "Published 5 blog posts",
    icon: "pen-tool",
    category: "writing",
    check: async (userId) => {
      const count = await prisma.blogPost.count({ where: { userId } });
      return count >= 5;
    },
  },
  {
    name: "Build in Public",
    description: "Tweeted about your work 20 times",
    icon: "megaphone",
    category: "social",
    check: async (userId) => {
      const count = await prisma.tweet.count({ where: { userId } });
      return count >= 20;
    },
  },
  {
    name: "Goal Getter",
    description: "Completed 50 goals",
    icon: "target",
    category: "planning",
    check: async (userId) => {
      const count = await prisma.goal.count({ where: { userId, status: "COMPLETED" } });
      return count >= 50;
    },
  },
];

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { name: true },
  });
  const earnedNames = new Set(existingBadges.map((b) => b.name));
  const newBadges: string[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earnedNames.has(def.name)) continue;

    const eligible = await def.check(userId);
    if (eligible) {
      await prisma.badge.create({
        data: {
          userId,
          name: def.name,
          description: def.description,
          icon: def.icon,
          category: def.category,
        },
      });
      newBadges.push(def.name);
    }
  }

  return newBadges;
}

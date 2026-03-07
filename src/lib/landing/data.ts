import "server-only";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const fetchPlatformStats = unstable_cache(
  async () => {
    const [totalUsers, totalContributions, totalProjects, totalBlogs] =
      await Promise.all([
        prisma.user.count(),
        prisma.gitHubActivity.count(),
        prisma.project.count(),
        prisma.blogPost.count(),
      ]);
    return { totalUsers, totalContributions, totalProjects, totalBlogs };
  },
  ["platform-stats"],
  { revalidate: 300 }
);

export const fetchHeatmapData = unstable_cache(
  async () => {
    const users = await prisma.user.findMany({
      where: { state: { not: null } },
      select: {
        state: true,
        _count: {
          select: {
            githubActivities: true,
            tweets: true,
            blogPosts: true,
          },
        },
      },
    });

    const data: Record<string, { users: number; commits: number; content: number }> = {};
    for (const user of users) {
      const stateId = user.state!;
      if (!data[stateId]) data[stateId] = { users: 0, commits: 0, content: 0 };
      data[stateId].users += 1;
      data[stateId].commits += user._count.githubActivities;
      data[stateId].content += user._count.tweets + user._count.blogPosts;
    }
    return data;
  },
  ["heatmap-data"],
  { revalidate: 300 }
);

export const fetchRecentActivity = unstable_cache(
  async () => {
    const [commits, tweets, blogs] = await Promise.all([
      prisma.gitHubActivity.findMany({
        take: 10,
        orderBy: { occurredAt: "desc" },
        select: {
          title: true,
          repo: true,
          type: true,
          user: { select: { name: true, image: true } },
        },
      }),
      prisma.tweet.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          content: true,
          user: { select: { name: true, image: true } },
        },
      }),
      prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          title: true,
          user: { select: { name: true, image: true } },
        },
      }),
    ]);

    const activities = [
      ...commits.map((c) => ({
        type: "commit" as const,
        title: `committed to ${c.repo}`,
        userName: c.user.name || "Anonymous",
        userImage: c.user.image,
      })),
      ...tweets.map((t) => ({
        type: "tweet" as const,
        title: `tweeted: "${(t.content || "").slice(0, 60)}..."`,
        userName: t.user.name || "Anonymous",
        userImage: t.user.image,
      })),
      ...blogs.map((b) => ({
        type: "blog" as const,
        title: `published "${b.title}"`,
        userName: b.user.name || "Anonymous",
        userImage: b.user.image,
      })),
    ];

    return activities.slice(0, 15);
  },
  ["recent-activity"],
  { revalidate: 300 }
);

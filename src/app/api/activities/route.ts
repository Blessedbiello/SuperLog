import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

type ActivityType = "github" | "tweet" | "blog";

interface NormalizedActivity {
  id: string;
  type: ActivityType;
  title: string;
  url: string | null;
  date: Date;
  projectId?: string | null;
  tags?: string[];
  meta: Record<string, unknown>;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;

  const typeParam = searchParams.get("type") as ActivityType | null;
  const projectId = searchParams.get("projectId");
  const rawLimit = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
  const rawOffset = parseInt(searchParams.get("offset") ?? "0", 10);

  const limit = isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : Math.min(rawLimit, MAX_LIMIT);
  const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

  const validTypes: ActivityType[] = ["github", "tweet", "blog"];
  if (typeParam && !validTypes.includes(typeParam)) {
    return errorResponse("Invalid type. Must be one of: github, tweet, blog", 400);
  }

  const userId = session.user.id;
  const activities: NormalizedActivity[] = [];

  // Fetch GitHub activities
  if (!typeParam || typeParam === "github") {
    const githubWhere: Parameters<typeof prisma.gitHubActivity.findMany>[0]["where"] = {
      userId,
    };
    if (projectId) githubWhere.projectId = projectId;

    const githubActivities = await prisma.gitHubActivity.findMany({
      where: githubWhere,
      orderBy: { occurredAt: "desc" },
    });

    for (const item of githubActivities) {
      activities.push({
        id: item.id,
        type: "github",
        title: item.title,
        url: item.url ?? null,
        date: item.occurredAt,
        projectId: item.projectId,
        meta: {
          repo: item.repo,
          activityType: item.type,
          githubId: item.githubId,
          metadata: item.metadata,
        },
      });
    }
  }

  // Fetch tweets
  if (!typeParam || typeParam === "tweet") {
    // Tweets are not project-scoped — skip if projectId filter is active
    if (!projectId) {
      const tweets = await prisma.tweet.findMany({
        where: { userId },
        orderBy: { postedAt: "desc" },
      });

      for (const item of tweets) {
        activities.push({
          id: item.id,
          type: "tweet",
          title: item.content ?? item.url,
          url: item.url,
          date: item.postedAt ?? item.createdAt,
          tags: item.tags,
          meta: {
            tweetId: item.tweetId,
            metrics: item.metrics,
          },
        });
      }
    }
  }

  // Fetch blog posts
  if (!typeParam || typeParam === "blog") {
    // Blog posts are not project-scoped — skip if projectId filter is active
    if (!projectId) {
      const blogPosts = await prisma.blogPost.findMany({
        where: { userId },
        orderBy: { publishedAt: "desc" },
      });

      for (const item of blogPosts) {
        activities.push({
          id: item.id,
          type: "blog",
          title: item.title,
          url: item.url,
          date: item.publishedAt ?? item.createdAt,
          tags: item.tags,
          meta: {
            platform: item.platform,
            summary: item.summary,
          },
        });
      }
    }
  }

  // Sort all merged activities by date descending
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  const total = activities.length;
  const paginated = activities.slice(offset, offset + limit);

  return successResponse({
    items: paginated,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}

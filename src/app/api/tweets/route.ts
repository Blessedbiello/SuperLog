import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { tweetCreateSchema } from "@/lib/utils/validation";
import { NextRequest } from "next/server";

/**
 * Extract the tweet ID from a Twitter/X URL.
 * Handles formats:
 *   https://twitter.com/user/status/1234567890
 *   https://x.com/user/status/1234567890
 */
function extractTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const tweets = await prisma.tweet.findMany({
    where: { userId: session.user.id },
    orderBy: { postedAt: "desc" },
    include: { verification: { select: { status: true } } },
  });

  return successResponse(tweets);
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = tweetCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  // Derive tweetId from URL when not explicitly provided
  const tweetId = parsed.data.tweetId ?? extractTweetId(parsed.data.url) ?? undefined;

  const existing = await prisma.tweet.findUnique({
    where: { url: parsed.data.url },
  });
  if (existing) return errorResponse("A tweet with this URL already exists", 409);

  const tweet = await prisma.tweet.create({
    data: {
      ...parsed.data,
      tweetId,
      userId: session.user.id,
    },
  });

  return successResponse(tweet, 201);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { syncGitHubActivities } from "@/lib/github/sync";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return errorResponse("Unauthorized", 401);
  }

  const accounts = await prisma.account.findMany({
    where: { provider: "github" },
    select: { userId: true },
  });

  const results: { userId: string; synced: number }[] = [];

  for (const account of accounts) {
    try {
      const count = await syncGitHubActivities(account.userId);
      results.push({ userId: account.userId, synced: count });
    } catch (error) {
      console.error(`Failed to sync GitHub for ${account.userId}:`, error);
    }
  }

  return successResponse({ synced: results.length, results });
}

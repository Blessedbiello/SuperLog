import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { generateWeeklyReport } from "@/lib/reports/generator";
import { updateStreaks } from "@/lib/streaks/tracker";
import { checkAndAwardBadges } from "@/lib/badges/engine";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return errorResponse("Unauthorized", 401);
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  const now = new Date();
  const results: { userId: string; score: number }[] = [];

  for (const user of users) {
    try {
      const report = await generateWeeklyReport(user.id, now);
      await updateStreaks(user.id);
      await checkAndAwardBadges(user.id);
      results.push({ userId: user.id, score: report.score });
    } catch (error) {
      console.error(`Failed to generate report for ${user.id}:`, error);
    }
  }

  return successResponse({ generated: results.length, results });
}

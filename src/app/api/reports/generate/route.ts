import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { generateWeeklyReport } from "@/lib/reports/generator";
import { updateStreaks } from "@/lib/streaks/tracker";
import { checkAndAwardBadges } from "@/lib/badges/engine";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const weekStart = body.weekStart ? new Date(body.weekStart) : new Date();

  const report = await generateWeeklyReport(session.user.id, weekStart);

  await updateStreaks(session.user.id);
  await checkAndAwardBadges(session.user.id);

  return successResponse(report);
}

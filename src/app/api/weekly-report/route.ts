import { NextRequest } from "next/server";
import { z } from "zod";
import { startOfWeek, endOfWeek } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

const weeklyPlanSchema = z.object({
  weekStart: z.coerce.date(),
  plannedScore: z.number().min(0).max(100),
});

function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = weeklyPlanSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const weekStart = startOfWeek(parsed.data.weekStart, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(parsed.data.weekStart, { weekStartsOn: 1 });

  const normalizedWeekStart = toUtcDateOnly(weekStart);
  const normalizedWeekEnd = toUtcDateOnly(weekEnd);

  const report = await prisma.weeklyReport.upsert({
    where: {
      userId_weekStart: {
        userId: session.user.id,
        weekStart: normalizedWeekStart,
      },
    },
    update: {
      plannedScore: parsed.data.plannedScore,
      weekEnd: normalizedWeekEnd,
    },
    create: {
      userId: session.user.id,
      weekStart: normalizedWeekStart,
      weekEnd: normalizedWeekEnd,
      plannedScore: parsed.data.plannedScore,
    },
  });

  return successResponse(report);
}

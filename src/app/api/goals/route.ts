import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { goalCreateSchema } from "@/lib/utils/validation";
import { GoalType, GoalStatus } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;

  const typeParam = searchParams.get("type");
  const statusParam = searchParams.get("status");
  const weekParam = searchParams.get("week"); // ISO date string for start of week

  // Validate optional enum filters
  const validTypes = Object.values(GoalType);
  if (typeParam && !validTypes.includes(typeParam as GoalType)) {
    return errorResponse(`Invalid type. Must be one of: ${validTypes.join(", ")}`, 400);
  }

  const validStatuses = Object.values(GoalStatus);
  if (statusParam && !validStatuses.includes(statusParam as GoalStatus)) {
    return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
  }

  const where: Parameters<typeof prisma.goal.findMany>[0]["where"] = {
    userId: session.user.id,
  };

  if (typeParam) where.type = typeParam as GoalType;
  if (statusParam) where.status = statusParam as GoalStatus;

  // Filter by week: match goals whose targetDate falls within the 7-day window
  // starting at the provided date
  if (weekParam) {
    const weekStart = new Date(weekParam);
    if (isNaN(weekStart.getTime())) {
      return errorResponse("Invalid week date format", 400);
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    where.targetDate = {
      gte: weekStart,
      lt: weekEnd,
    };
  }

  const goals = await prisma.goal.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } },
      keyResult: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(goals);
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = goalCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  // Verify project ownership when a projectId is provided
  if (parsed.data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
    });
    if (!project) return errorResponse("Project not found", 404);
    if (project.userId !== session.user.id) return errorResponse("Forbidden", 403);
  }

  const goal = await prisma.goal.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
    include: {
      project: { select: { id: true, name: true } },
      keyResult: { select: { id: true, title: true } },
    },
  });

  return successResponse(goal, 201);
}

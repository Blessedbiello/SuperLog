import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { calendarEventCreateSchema } from "@/lib/utils/validation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return errorResponse("Query params 'start' and 'end' are required", 400);
  }

  const start = new Date(startParam);
  const end = new Date(endParam);

  if (isNaN(start.getTime())) return errorResponse("Invalid 'start' date", 400);
  if (isNaN(end.getTime())) return errorResponse("Invalid 'end' date", 400);
  if (end <= start) return errorResponse("'end' must be after 'start'", 400);

  const events = await prisma.calendarEvent.findMany({
    where: {
      userId: session.user.id,
      // Return events that overlap the requested window.
      startTime: { lt: end },
      endTime: { gt: start },
    },
    include: {
      goal: { select: { id: true, title: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return successResponse(events);
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = calendarEventCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  // Verify goal ownership when a goalId is provided
  if (parsed.data.goalId) {
    const goal = await prisma.goal.findUnique({ where: { id: parsed.data.goalId } });
    if (!goal) return errorResponse("Goal not found", 404);
    if (goal.userId !== session.user.id) return errorResponse("Forbidden", 403);
  }

  // Verify project ownership when a projectId is provided
  if (parsed.data.projectId) {
    const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
    if (!project) return errorResponse("Project not found", 404);
    if (project.userId !== session.user.id) return errorResponse("Forbidden", 403);
  }

  const event = await prisma.calendarEvent.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
    include: {
      goal: { select: { id: true, title: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return successResponse(event, 201);
}

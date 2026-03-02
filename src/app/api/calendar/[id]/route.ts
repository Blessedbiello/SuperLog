import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { calendarEventUpdateSchema } from "@/lib/utils/validation";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing) return errorResponse("Calendar event not found", 404);
  if (existing.userId !== session.user.id) return errorResponse("Forbidden", 403);

  const body = await request.json();
  const parsed = calendarEventUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  // Verify goal ownership when reassigning to a different goal
  if (parsed.data.goalId && parsed.data.goalId !== existing.goalId) {
    const goal = await prisma.goal.findUnique({ where: { id: parsed.data.goalId } });
    if (!goal) return errorResponse("Goal not found", 404);
    if (goal.userId !== session.user.id) return errorResponse("Forbidden", 403);
  }

  // Verify project ownership when reassigning to a different project
  if (parsed.data.projectId && parsed.data.projectId !== existing.projectId) {
    const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
    if (!project) return errorResponse("Project not found", 404);
    if (project.userId !== session.user.id) return errorResponse("Forbidden", 403);
  }

  const updated = await prisma.calendarEvent.update({
    where: { id },
    data: parsed.data,
    include: {
      goal: { select: { id: true, title: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return successResponse(updated);
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing) return errorResponse("Calendar event not found", 404);
  if (existing.userId !== session.user.id) return errorResponse("Forbidden", 403);

  await prisma.calendarEvent.delete({ where: { id } });

  return successResponse({ deleted: true });
}

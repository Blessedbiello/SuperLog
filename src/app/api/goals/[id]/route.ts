import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { goalUpdateSchema } from "@/lib/utils/validation";
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

  const existing = await prisma.goal.findUnique({ where: { id } });
  if (!existing) return errorResponse("Goal not found", 404);
  if (existing.userId !== session.user.id) return errorResponse("Forbidden", 403);

  const body = await request.json();
  const parsed = goalUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  // Verify project ownership when reassigning to a different project
  if (parsed.data.projectId && parsed.data.projectId !== existing.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
    });
    if (!project) return errorResponse("Project not found", 404);
    if (project.userId !== session.user.id) return errorResponse("Forbidden", 403);
  }

  // Verify key-result ownership when reassigning to a different key result
  if (parsed.data.keyResultId && parsed.data.keyResultId !== existing.keyResultId) {
    const keyResult = await prisma.keyResult.findFirst({
      where: {
        id: parsed.data.keyResultId,
        objective: { userId: session.user.id },
      },
      select: { id: true },
    });
    if (!keyResult) return errorResponse("Key result not found", 404);
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: parsed.data,
    include: {
      project: { select: { id: true, name: true } },
      keyResult: { select: { id: true, title: true } },
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

  const existing = await prisma.goal.findUnique({ where: { id } });
  if (!existing) return errorResponse("Goal not found", 404);
  if (existing.userId !== session.user.id) return errorResponse("Forbidden", 403);

  await prisma.goal.delete({ where: { id } });

  return successResponse({ deleted: true });
}

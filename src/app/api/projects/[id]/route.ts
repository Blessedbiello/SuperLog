import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { projectUpdateSchema } from "@/lib/utils/validation";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { githubActivities: true },
      },
    },
  });

  if (!project) return errorResponse("Project not found", 404);
  if (project.userId !== session.user.id) return errorResponse("Forbidden", 403);

  return successResponse(project);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return errorResponse("Project not found", 404);
  if (existing.userId !== session.user.id) return errorResponse("Forbidden", 403);

  const body = await request.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const updated = await prisma.project.update({
    where: { id },
    data: parsed.data,
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

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return errorResponse("Project not found", 404);
  if (existing.userId !== session.user.id) return errorResponse("Forbidden", 403);

  await prisma.project.delete({ where: { id } });

  return successResponse({ deleted: true });
}

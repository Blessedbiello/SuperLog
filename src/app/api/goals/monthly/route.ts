import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { z } from "zod";

const objectiveCreateSchema = z.object({
  title: z.string().min(1).max(200),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024),
});

const keyResultCreateSchema = z.object({
  title: z.string().min(1).max(200),
  target: z.number().positive().default(1),
  objectiveId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const now = new Date();
  const where = {
    userId: session.user.id,
    month: month ? parseInt(month) : now.getMonth() + 1,
    year: year ? parseInt(year) : now.getFullYear(),
  };

  const objectives = await prisma.monthlyObjective.findMany({
    where,
    include: {
      keyResults: {
        include: {
          goals: { select: { id: true, title: true, status: true, type: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return successResponse(objectives);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();

  // Check if it's a key result or objective
  if (body.objectiveId) {
    const parsed = keyResultCreateSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

    const objective = await prisma.monthlyObjective.findFirst({
      where: { id: parsed.data.objectiveId, userId: session.user.id },
    });
    if (!objective) return errorResponse("Objective not found", 404);

    const keyResult = await prisma.keyResult.create({
      data: parsed.data,
    });
    return successResponse(keyResult, 201);
  }

  const parsed = objectiveCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const objective = await prisma.monthlyObjective.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  });

  return successResponse(objective, 201);
}

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { startOfWeek } from "date-fns";
import { z } from "zod";

const shoutoutSchema = z.object({
  message: z.string().min(1).max(500),
  toUserId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const shoutouts = await prisma.shoutout.findMany({
    where: userId ? { toUserId: userId } : { weekStart },
    include: {
      from: { select: { id: true, name: true, image: true } },
      to: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return successResponse(shoutouts);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = shoutoutSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  if (parsed.data.toUserId === session.user.id) {
    return errorResponse("Cannot shoutout yourself", 400);
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const existing = await prisma.shoutout.findFirst({
    where: { fromUserId: session.user.id, toUserId: parsed.data.toUserId, weekStart },
  });
  if (existing) return errorResponse("Already sent a shoutout to this member this week", 400);

  const shoutout = await prisma.shoutout.create({
    data: {
      ...parsed.data,
      fromUserId: session.user.id,
      weekStart,
    },
    include: {
      from: { select: { id: true, name: true, image: true } },
      to: { select: { id: true, name: true, image: true } },
    },
  });

  return successResponse(shoutout, 201);
}

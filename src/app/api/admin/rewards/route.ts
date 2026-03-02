import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { startOfWeek } from "date-fns";
import { z } from "zod";

const rewardSchema = z.object({
  userId: z.string().min(1),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  currency: z.string().default("SOL"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return errorResponse("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = rewardSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const reward = await prisma.reward.create({
    data: {
      ...parsed.data,
      weekStart,
      awardedById: session.user.id,
    },
  });

  return successResponse(reward, 201);
}

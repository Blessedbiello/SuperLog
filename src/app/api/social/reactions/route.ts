import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { z } from "zod";

const reactionSchema = z.object({
  type: z.enum(["fire", "gem", "rocket", "100"]),
  activityType: z.enum(["github", "tweet", "blog"]),
  activityId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const existing = await prisma.reaction.findUnique({
    where: {
      userId_activityType_activityId: {
        userId: session.user.id,
        activityType: parsed.data.activityType,
        activityId: parsed.data.activityId,
      },
    },
  });

  if (existing) {
    if (existing.type === parsed.data.type) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return successResponse({ removed: true });
    }
    const updated = await prisma.reaction.update({
      where: { id: existing.id },
      data: { type: parsed.data.type },
    });
    return successResponse(updated);
  }

  const reaction = await prisma.reaction.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return successResponse(reaction, 201);
}

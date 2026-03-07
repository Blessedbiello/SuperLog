import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  twitterHandle: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
});

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return successResponse(user);
}

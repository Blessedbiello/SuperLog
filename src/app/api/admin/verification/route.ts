import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return errorResponse("Unauthorized", 401);
  }

  const { id, status, notes } = await request.json();

  if (!id || !["VERIFIED", "REJECTED"].includes(status)) {
    return errorResponse("Invalid request", 400);
  }

  const verification = await prisma.verification.update({
    where: { id },
    data: { status, notes, verifiedById: session.user.id },
  });

  return successResponse(verification);
}

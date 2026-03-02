import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { dailyFocusSchema } from "@/lib/utils/validation";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = dailyFocusSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const { date, focus } = parsed.data;

  // Normalize to a plain date (strip time component) so the @@unique([userId, date])
  // constraint on the @db.Date column is respected regardless of time zone offset
  // passed from the client.
  const normalizedDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  const dailyFocus = await prisma.dailyFocus.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: normalizedDate,
      },
    },
    update: { focus },
    create: {
      userId: session.user.id,
      date: normalizedDate,
      focus,
    },
  });

  return successResponse(dailyFocus);
}

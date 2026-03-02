import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { blogPostCreateSchema } from "@/lib/utils/validation";
import { NextRequest } from "next/server";

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const blogPosts = await prisma.blogPost.findMany({
    where: { userId: session.user.id },
    orderBy: { publishedAt: "desc" },
  });

  return successResponse(blogPosts);
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = blogPostCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const existing = await prisma.blogPost.findUnique({
    where: { url: parsed.data.url },
  });
  if (existing) return errorResponse("A blog post with this URL already exists", 409);

  const blogPost = await prisma.blogPost.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  });

  return successResponse(blogPost, 201);
}

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { syncGitHubActivities } from "@/lib/github/sync";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

/**
 * POST /api/github/sync
 *
 * Triggers a GitHub activity sync for the authenticated user.
 *
 * Query parameters:
 *   - repo (optional): Restrict sync to a single "owner/repo".
 *
 * Responses:
 *   200 - { newActivities: number, reposSynced: string[] }
 *   401 - Unauthorized
 *   400 - Bad request (invalid repo format, missing token, etc.)
 *   500 - Unexpected server error
 */
export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", 401);
  }

  const repo = request.nextUrl.searchParams.get("repo") ?? undefined;

  try {
    const result = await syncGitHubActivities(session.user.id, repo);

    return successResponse({
      newActivities: result.newActivities,
      reposSynced: result.reposSynced,
      message:
        result.newActivities === 0
          ? "Already up to date."
          : `Synced ${result.newActivities} new ${result.newActivities === 1 ? "activity" : "activities"}.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed.";

    // Surface access-token / bad-repo errors as 400; everything else as 500
    const isBadRequest =
      message.includes("No GitHub access token") ||
      message.includes("Invalid repo format");

    return errorResponse(message, isBadRequest ? 400 : 500);
  }
}

import { Octokit } from "octokit";
import { prisma } from "@/lib/prisma";

/**
 * Creates an authenticated Octokit instance for the given user by fetching
 * their GitHub OAuth access token from the Account table.
 *
 * Throws if the user has no linked GitHub account or the token is missing.
 */
export async function getOctokit(userId: string): Promise<Octokit> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    throw new Error(
      `No GitHub access token found for user ${userId}. ` +
        "Ensure the user has connected their GitHub account."
    );
  }

  return new Octokit({ auth: account.access_token });
}

export interface RepoInfo {
  fullName: string;
  name: string;
  owner: string;
  private: boolean;
  url: string;
  updatedAt: string | null;
}

/**
 * Returns the list of repositories the authenticated user has access to,
 * sorted by most recently updated. Fetches up to 100 repos.
 */
export async function getUserRepos(userId: string): Promise<RepoInfo[]> {
  const octokit = await getOctokit(userId);

  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
    affiliation: "owner,collaborator,organization_member",
  });

  return repos.map((repo) => ({
    fullName: repo.full_name,
    name: repo.name,
    owner: repo.owner.login,
    private: repo.private,
    url: repo.html_url,
    updatedAt: repo.updated_at ?? null,
  }));
}

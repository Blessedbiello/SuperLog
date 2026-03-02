import { GitHubActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOctokit } from "./client";

// Number of days back to look for events during a sync
const LOOKBACK_DAYS = 30;

interface SyncResult {
  newActivities: number;
  reposSynced: string[];
}

/**
 * Syncs recent GitHub activities (commits, PRs, issues, reviews) for the
 * given user into the GitHubActivity table. Upserts by `githubId` so
 * re-running the sync is always idempotent.
 *
 * @param userId - The SuperLog user ID.
 * @param repo   - Optional "owner/repo" string to restrict the sync to a
 *                 single repository. When omitted all accessible repos are
 *                 synced.
 * @returns The count of newly-inserted activities.
 */
export async function syncGitHubActivities(
  userId: string,
  repo?: string
): Promise<SyncResult> {
  const octokit = await getOctokit(userId);

  // Resolve which repos to sync
  let reposToSync: Array<{ owner: string; name: string; fullName: string }> = [];

  if (repo) {
    const [owner, name] = repo.split("/");
    if (!owner || !name) {
      throw new Error(`Invalid repo format "${repo}". Expected "owner/repo".`);
    }
    reposToSync = [{ owner, name, fullName: repo }];
  } else {
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 50,
      affiliation: "owner,collaborator,organization_member",
    });
    reposToSync = repos.map((r) => ({
      owner: r.owner.login,
      name: r.name,
      fullName: r.full_name,
    }));
  }

  // Fetch GitHub username once for commit attribution
  const { data: ghUser } = await octokit.rest.users.getAuthenticated();
  const githubLogin = ghUser.login;

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let newActivities = 0;

  for (const { owner, name: repoName, fullName } of reposToSync) {
    const results = await Promise.allSettled([
      syncCommits(octokit, userId, owner, repoName, fullName, githubLogin, since),
      syncPullRequests(octokit, userId, owner, repoName, fullName, githubLogin, since),
      syncIssues(octokit, userId, owner, repoName, fullName, githubLogin, since),
      syncReviews(octokit, userId, owner, repoName, fullName, githubLogin, since),
    ]);

    for (const result of results) {
      if (result.status === "fulfilled") {
        newActivities += result.value;
      }
      // Silently skip repos/endpoints that return 404 or 403 (no access)
    }
  }

  return { newActivities, reposSynced: reposToSync.map((r) => r.fullName) };
}

// ─── Per-type sync helpers ────────────────────────────────────────────────────

async function syncCommits(
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  userId: string,
  owner: string,
  repo: string,
  fullName: string,
  githubLogin: string,
  since: string
): Promise<number> {
  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    author: githubLogin,
    since,
    per_page: 100,
  });

  let count = 0;

  for (const commit of commits) {
    const githubId = `commit:${commit.sha}`;
    const existing = await prisma.gitHubActivity.findUnique({
      where: { githubId },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.gitHubActivity.create({
      data: {
        type: GitHubActivityType.COMMIT,
        title: commit.commit.message.split("\n")[0].slice(0, 255),
        url: commit.html_url,
        repo: fullName,
        githubId,
        occurredAt: new Date(commit.commit.author?.date ?? commit.commit.committer?.date ?? Date.now()),
        userId,
        metadata: {
          sha: commit.sha,
          author: commit.commit.author?.name ?? githubLogin,
          additions: null,
          deletions: null,
        },
      },
    });

    count++;
  }

  return count;
}

async function syncPullRequests(
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  userId: string,
  owner: string,
  repo: string,
  fullName: string,
  githubLogin: string,
  since: string
): Promise<number> {
  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: 50,
  });

  const sinceDate = new Date(since);
  let count = 0;

  for (const pr of prs) {
    // Only include PRs authored by this user within the lookback window
    if (pr.user?.login !== githubLogin) continue;
    if (new Date(pr.updated_at) < sinceDate) break;

    const githubId = `pr:${pr.id}`;
    const existing = await prisma.gitHubActivity.findUnique({
      where: { githubId },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.gitHubActivity.create({
      data: {
        type: GitHubActivityType.PR,
        title: pr.title,
        url: pr.html_url,
        repo: fullName,
        githubId,
        occurredAt: new Date(pr.created_at),
        userId,
        metadata: {
          number: pr.number,
          state: pr.state,
          merged: pr.merged_at !== null,
          mergedAt: pr.merged_at ?? null,
          draft: pr.draft ?? false,
        },
      },
    });

    count++;
  }

  return count;
}

async function syncIssues(
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  userId: string,
  owner: string,
  repo: string,
  fullName: string,
  githubLogin: string,
  since: string
): Promise<number> {
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    creator: githubLogin,
    state: "all",
    since,
    per_page: 50,
  });

  let count = 0;

  for (const issue of issues) {
    // The GitHub API returns both issues and PRs; skip PRs here
    if (issue.pull_request) continue;

    const githubId = `issue:${issue.id}`;
    const existing = await prisma.gitHubActivity.findUnique({
      where: { githubId },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.gitHubActivity.create({
      data: {
        type: GitHubActivityType.ISSUE,
        title: issue.title,
        url: issue.html_url,
        repo: fullName,
        githubId,
        occurredAt: new Date(issue.created_at),
        userId,
        metadata: {
          number: issue.number,
          state: issue.state,
          labels: issue.labels.map((l) =>
            typeof l === "string" ? l : (l.name ?? "")
          ),
        },
      },
    });

    count++;
  }

  return count;
}

async function syncReviews(
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  userId: string,
  owner: string,
  repo: string,
  fullName: string,
  githubLogin: string,
  since: string
): Promise<number> {
  // Fetch open + closed PRs and look for reviews by this user
  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: 30,
  });

  const sinceDate = new Date(since);
  let count = 0;

  for (const pr of prs) {
    if (new Date(pr.updated_at) < sinceDate) break;

    // Skip PRs authored by the user — we don't count self-reviews
    if (pr.user?.login === githubLogin) continue;

    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: pr.number,
    });

    for (const review of reviews) {
      if (review.user?.login !== githubLogin) continue;
      if (!review.submitted_at || new Date(review.submitted_at) < sinceDate) continue;

      const githubId = `review:${review.id}`;
      const existing = await prisma.gitHubActivity.findUnique({
        where: { githubId },
        select: { id: true },
      });

      if (existing) continue;

      await prisma.gitHubActivity.create({
        data: {
          type: GitHubActivityType.REVIEW,
          title: `Review on: ${pr.title}`,
          url: review.html_url,
          repo: fullName,
          githubId,
          occurredAt: new Date(review.submitted_at),
          userId,
          metadata: {
            prNumber: pr.number,
            prTitle: pr.title,
            state: review.state,
          },
        },
      });

      count++;
    }
  }

  return count;
}

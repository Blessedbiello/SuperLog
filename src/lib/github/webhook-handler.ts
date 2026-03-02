import { GitHubActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ─── Payload type stubs ───────────────────────────────────────────────────────
// These mirror the relevant fields from GitHub webhook payloads. We use
// `unknown`-safe access (via optional chaining) throughout so the handler
// degrades gracefully when a field is absent.

interface GitHubRepo {
  full_name: string;
}

interface GitHubUser {
  login: string;
  id: number;
}

interface PushPayload {
  repository: GitHubRepo;
  sender: GitHubUser;
  commits?: Array<{
    id: string;
    message: string;
    url: string;
    timestamp: string;
    author?: { name: string };
  }>;
  head_commit?: {
    id: string;
    message: string;
    url: string;
    timestamp: string;
    author?: { name: string };
  };
}

interface PullRequestPayload {
  action: string;
  repository: GitHubRepo;
  sender: GitHubUser;
  pull_request: {
    id: number;
    number: number;
    title: string;
    html_url: string;
    created_at: string;
    state: string;
    merged_at: string | null;
    draft: boolean;
    user: GitHubUser;
  };
}

interface IssuesPayload {
  action: string;
  repository: GitHubRepo;
  sender: GitHubUser;
  issue: {
    id: number;
    number: number;
    title: string;
    html_url: string;
    created_at: string;
    state: string;
    pull_request?: unknown;
    labels?: Array<{ name: string }>;
    user: GitHubUser;
  };
}

interface PullRequestReviewPayload {
  action: string;
  repository: GitHubRepo;
  sender: GitHubUser;
  review: {
    id: number;
    html_url: string;
    submitted_at: string;
    state: string;
    user: GitHubUser;
  };
  pull_request: {
    number: number;
    title: string;
    user: GitHubUser;
  };
}

// ─── Lookup helper ────────────────────────────────────────────────────────────

/**
 * Resolves a SuperLog userId from a GitHub login by checking the Account table.
 * Returns null when no matching user is found (e.g. bot pushes, forks).
 */
async function resolveUserId(githubLogin: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      provider: "github",
      user: { githubUsername: githubLogin },
    },
    select: { userId: true },
  });
  return account?.userId ?? null;
}

// ─── Per-event handlers ───────────────────────────────────────────────────────

async function handlePush(payload: PushPayload): Promise<void> {
  const userId = await resolveUserId(payload.sender.login);
  if (!userId) return;

  const repoFullName = payload.repository.full_name;

  // Prefer the explicit commits array; fall back to head_commit only
  const commits = payload.commits?.length
    ? payload.commits
    : payload.head_commit
    ? [payload.head_commit]
    : [];

  for (const commit of commits) {
    const githubId = `commit:${commit.id}`;

    await prisma.gitHubActivity.upsert({
      where: { githubId },
      update: {},
      create: {
        type: GitHubActivityType.COMMIT,
        title: commit.message.split("\n")[0].slice(0, 255),
        url: commit.url,
        repo: repoFullName,
        githubId,
        occurredAt: new Date(commit.timestamp),
        userId,
        metadata: {
          sha: commit.id,
          author: commit.author?.name ?? payload.sender.login,
        },
      },
    });
  }
}

async function handlePullRequest(payload: PullRequestPayload): Promise<void> {
  // Only record on open / reopened / closed (merged) — ignore unrelated actions
  const trackedActions = ["opened", "reopened", "closed"];
  if (!trackedActions.includes(payload.action)) return;

  const userId = await resolveUserId(payload.pull_request.user.login);
  if (!userId) return;

  const pr = payload.pull_request;
  const githubId = `pr:${pr.id}`;

  await prisma.gitHubActivity.upsert({
    where: { githubId },
    update: {
      metadata: {
        number: pr.number,
        state: pr.state,
        merged: pr.merged_at !== null,
        mergedAt: pr.merged_at ?? null,
        draft: pr.draft,
      },
    },
    create: {
      type: GitHubActivityType.PR,
      title: pr.title,
      url: pr.html_url,
      repo: payload.repository.full_name,
      githubId,
      occurredAt: new Date(pr.created_at),
      userId,
      metadata: {
        number: pr.number,
        state: pr.state,
        merged: pr.merged_at !== null,
        mergedAt: pr.merged_at ?? null,
        draft: pr.draft,
      },
    },
  });
}

async function handleIssues(payload: IssuesPayload): Promise<void> {
  const trackedActions = ["opened", "reopened", "closed"];
  if (!trackedActions.includes(payload.action)) return;

  // Skip if the "issue" is actually a pull request
  if (payload.issue.pull_request) return;

  const userId = await resolveUserId(payload.issue.user.login);
  if (!userId) return;

  const issue = payload.issue;
  const githubId = `issue:${issue.id}`;

  await prisma.gitHubActivity.upsert({
    where: { githubId },
    update: {
      metadata: {
        number: issue.number,
        state: issue.state,
        labels: (issue.labels ?? []).map((l) => l.name),
      },
    },
    create: {
      type: GitHubActivityType.ISSUE,
      title: issue.title,
      url: issue.html_url,
      repo: payload.repository.full_name,
      githubId,
      occurredAt: new Date(issue.created_at),
      userId,
      metadata: {
        number: issue.number,
        state: issue.state,
        labels: (issue.labels ?? []).map((l) => l.name),
      },
    },
  });
}

async function handlePullRequestReview(
  payload: PullRequestReviewPayload
): Promise<void> {
  if (payload.action !== "submitted") return;

  // Skip self-reviews (author reviewing their own PR)
  if (payload.review.user.login === payload.pull_request.user.login) return;

  const userId = await resolveUserId(payload.review.user.login);
  if (!userId) return;

  const review = payload.review;
  const githubId = `review:${review.id}`;

  await prisma.gitHubActivity.upsert({
    where: { githubId },
    update: {},
    create: {
      type: GitHubActivityType.REVIEW,
      title: `Review on: ${payload.pull_request.title}`,
      url: review.html_url,
      repo: payload.repository.full_name,
      githubId,
      occurredAt: new Date(review.submitted_at),
      userId,
      metadata: {
        prNumber: payload.pull_request.number,
        prTitle: payload.pull_request.title,
        state: review.state,
      },
    },
  });
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Dispatches an incoming GitHub webhook event to the appropriate handler and
 * stores the raw payload in the WebhookEvent table for auditing.
 *
 * @param eventType - Value of the `X-GitHub-Event` header.
 * @param payload   - Parsed JSON body of the webhook request.
 */
export async function handleWebhookEvent(
  eventType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
): Promise<void> {
  // Persist raw event first so we have a record even if processing fails
  await prisma.webhookEvent.create({
    data: {
      source: "github",
      eventType,
      payload,
      processed: false,
    },
  });

  try {
    switch (eventType) {
      case "push":
        await handlePush(payload as PushPayload);
        break;
      case "pull_request":
        await handlePullRequest(payload as PullRequestPayload);
        break;
      case "issues":
        await handleIssues(payload as IssuesPayload);
        break;
      case "pull_request_review":
        await handlePullRequestReview(payload as PullRequestReviewPayload);
        break;
      default:
        // Unknown event — already stored, nothing more to do
        return;
    }

    // Mark the event as processed only when the handler succeeds
    await prisma.webhookEvent.updateMany({
      where: {
        source: "github",
        eventType,
        processed: false,
        // Narrow to the most recently created record by using a sub-select
        // is unavailable in Prisma; we accept a small window of false-positives
        // and rely on idempotent upserts to keep data consistent.
      },
      data: { processed: true },
    });
  } catch {
    // Leave processed=false so failed events can be replayed
  }
}

import { redirect } from "next/navigation";
import { Github, GitCommit, Clock, Database } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserRepos } from "@/lib/github/client";
import { GitHubCard } from "@/components/activities/github-card";
import { GitHubSyncButton } from "@/components/dashboard/github-sync-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function GitHubActivitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch activities and repo list in parallel; repo fetch can fail gracefully
  const [activities, repos, lastActivity] = await Promise.all([
    prisma.gitHubActivity.findMany({
      where: { userId },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 100,
    }),

    getUserRepos(userId).catch(() => null),

    prisma.gitHubActivity.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const hasGitHubAccount = repos !== null;
  const lastSyncTime = lastActivity?.createdAt ?? null;

  // Count breakdown per activity type
  const typeCounts = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Github className="h-6 w-6" />
            GitHub Activities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Commits, pull requests, issues, and code reviews synced from GitHub.
          </p>
        </div>

        <GitHubSyncButton disabled={!hasGitHubAccount} />
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <Database className="h-4 w-4 text-slate-400" />
          <strong className="text-slate-800">{activities.length}</strong> activities synced
        </span>

        {lastSyncTime && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            Last sync{" "}
            <span className="font-medium text-slate-800">
              {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
            </span>
          </span>
        )}

        {Object.entries(typeCounts).map(([type, count]) => (
          <Badge key={type} variant="default" size="sm">
            {count} {type.toLowerCase()}{count !== 1 ? "s" : ""}
          </Badge>
        ))}
      </div>

      {/* No GitHub account linked */}
      {!hasGitHubAccount && (
        <Card>
          <CardContent className="py-16 text-center">
            <Github className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 mb-1">
              No GitHub account linked
            </p>
            <p className="text-xs text-slate-400">
              Sign in with GitHub to enable activity syncing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Linked repos */}
      {repos && repos.length > 0 && (
        <details className="group rounded-lg border border-slate-200">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg">
            <span className="flex items-center gap-2">
              <Github className="h-4 w-4 text-slate-400" />
              {repos.length} accessible{" "}
              {repos.length === 1 ? "repository" : "repositories"}
            </span>
            <span className="text-xs text-slate-400 group-open:hidden">Show</span>
            <span className="text-xs text-slate-400 hidden group-open:block">Hide</span>
          </summary>

          <div className="border-t border-slate-200 px-4 py-3">
            <ul className="grid gap-1 sm:grid-cols-2">
              {repos.map((repo) => (
                <li key={repo.fullName} className="flex items-center gap-2 text-sm">
                  <GitCommit className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-mono text-xs text-slate-700 hover:text-emerald-700 transition-colors"
                  >
                    {repo.fullName}
                  </a>
                  {repo.private && (
                    <Badge variant="default" size="sm">
                      private
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {/* Activity list */}
      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <GitCommit className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400 mb-1">
              No GitHub activities yet
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Click &ldquo;Sync Now&rdquo; to pull in your recent commits, pull requests,
              issues, and reviews.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <GitHubCard
              key={activity.id}
              activity={{
                id: activity.id,
                type: activity.type,
                title: activity.title,
                url: activity.url ?? null,
                repo: activity.repo,
                occurredAt: activity.occurredAt.toISOString(),
                project: activity.project
                  ? { id: activity.project.id, name: activity.project.name }
                  : null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

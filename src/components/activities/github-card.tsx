"use client";

import {
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Eye,
  Tag,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GitHubCardActivity {
  id: string;
  type: "COMMIT" | "PR" | "ISSUE" | "REVIEW" | "RELEASE";
  title: string;
  url: string | null;
  repo: string;
  occurredAt: string;
  project?: { id: string; name: string } | null;
}

const typeMeta: Record<
  GitHubCardActivity["type"],
  { label: string; icon: React.ElementType; variant: "default" | "info" | "warning" | "success" }
> = {
  COMMIT: { label: "Commit", icon: GitCommit, variant: "default" },
  PR: { label: "Pull Request", icon: GitPullRequest, variant: "info" },
  ISSUE: { label: "Issue", icon: AlertCircle, variant: "warning" },
  REVIEW: { label: "Review", icon: Eye, variant: "success" },
  RELEASE: { label: "Release", icon: Tag, variant: "info" },
};

export function GitHubCard({ activity }: { activity: GitHubCardActivity }) {
  const meta = typeMeta[activity.type];
  const Icon = meta.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={meta.variant}>{meta.label}</Badge>
              <span className="text-xs text-slate-500">{activity.repo}</span>
              {activity.project && (
                <span className="text-xs text-emerald-700">{activity.project.name}</span>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {activity.title}
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span>
                {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
              </span>
              {activity.url && (
                <a
                  href={activity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  View
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

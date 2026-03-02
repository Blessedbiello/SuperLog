"use client";

import { GitCommit, GitPullRequest, AlertCircle, Eye, Tag, Twitter, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  url?: string | null;
  repo?: string;
  createdAt: string;
  project?: { name: string } | null;
}

const typeIcons: Record<string, React.ElementType> = {
  COMMIT: GitCommit,
  PR: GitPullRequest,
  ISSUE: AlertCircle,
  REVIEW: Eye,
  RELEASE: Tag,
  TWEET: Twitter,
  BLOG: FileText,
};

const typeLabels: Record<string, string> = {
  COMMIT: "Commit",
  PR: "Pull Request",
  ISSUE: "Issue",
  REVIEW: "Review",
  RELEASE: "Release",
  TWEET: "Tweet",
  BLOG: "Blog Post",
};

export function ActivityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">No recent activity. Start logging your work!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y">
        {items.map((item) => {
          const Icon = typeIcons[item.type] || GitCommit;
          return (
            <div key={item.id} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 rounded-lg bg-gray-100 p-2">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 truncate">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="default">{typeLabels[item.type] || item.type}</Badge>
                  {item.repo && <span className="text-xs text-gray-400">{item.repo}</span>}
                  {item.project && (
                    <span className="text-xs text-emerald-600">{item.project.name}</span>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-xs text-gray-400">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

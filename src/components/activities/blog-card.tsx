"use client";

import { FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  id: string;
  title: string;
  url: string;
  platform: string | null;
  summary: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  verification?: { status: string } | null;
}

export function BlogCard({ blog }: { blog: BlogCardProps }) {
  const displayDate = blog.publishedAt ?? blog.createdAt;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
            <FileText className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Blog</Badge>
              {blog.platform && (
                <Badge variant="default">{blog.platform}</Badge>
              )}
              {blog.verification && (
                <Badge
                  variant={
                    blog.verification.status === "VERIFIED"
                      ? "success"
                      : blog.verification.status === "REJECTED"
                        ? "danger"
                        : "warning"
                  }
                >
                  {blog.verification.status.toLowerCase()}
                </Badge>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-slate-900">
              {blog.title}
            </p>

            {blog.summary && (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {blog.summary}
              </p>
            )}

            {blog.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span>
                {formatDistanceToNow(new Date(displayDate), { addSuffix: true })}
              </span>
              <a
                href={blog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700"
              >
                <ExternalLink className="h-3 w-3" />
                View
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Twitter, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TweetCardProps {
  id: string;
  url: string;
  content: string | null;
  tags: string[];
  postedAt: string | null;
  createdAt: string;
  verification?: { status: string } | null;
}

export function TweetCard({ tweet }: { tweet: TweetCardProps }) {
  const displayDate = tweet.postedAt ?? tweet.createdAt;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sky-100 p-2 text-sky-600">
            <Twitter className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Tweet</Badge>
              {tweet.verification && (
                <Badge
                  variant={
                    tweet.verification.status === "VERIFIED"
                      ? "success"
                      : tweet.verification.status === "REJECTED"
                        ? "danger"
                        : "warning"
                  }
                >
                  {tweet.verification.status.toLowerCase()}
                </Badge>
              )}
            </div>

            {tweet.content && (
              <p className="mt-1 text-sm text-slate-700 line-clamp-2">
                {tweet.content}
              </p>
            )}

            {tweet.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tweet.tags.map((tag) => (
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
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700"
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

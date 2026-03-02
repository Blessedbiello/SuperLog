"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ReactionButtons } from "./reaction-buttons";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  url?: string | null;
  activityType: string;
  createdAt: string;
  user: { name: string | null; image: string | null; githubUsername: string | null };
  reactions: Record<string, number>;
  userReaction?: string | null;
}

export function CommunityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">No community activity yet. Be the first to log!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <Avatar src={item.user.image} name={item.user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{item.user.name}</span>
                <Badge variant="default">{item.type}</Badge>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700 truncate">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </p>
              <div className="mt-2">
                <ReactionButtons
                  activityType={item.activityType}
                  activityId={item.id}
                  initialReactions={item.reactions}
                  userReaction={item.userReaction}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

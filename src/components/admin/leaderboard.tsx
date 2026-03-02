"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  user: { name: string | null; image: string | null; githubUsername: string | null };
  score: number;
  previousScore?: number;
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b px-4 py-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-semibold text-gray-900">Weekly Leaderboard</h3>
      </div>
      <div className="divide-y">
        {entries.map((entry) => {
          const trend = entry.previousScore !== undefined
            ? entry.score > entry.previousScore ? "up" : entry.score < entry.previousScore ? "down" : "same"
            : "same";

          return (
            <div key={entry.rank} className="flex items-center gap-3 px-4 py-3">
              <span className={`text-lg font-bold w-8 ${entry.rank <= 3 ? "text-amber-500" : "text-gray-400"}`}>
                #{entry.rank}
              </span>
              <Avatar src={entry.user.image} name={entry.user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{entry.user.name}</p>
                {entry.user.githubUsername && (
                  <p className="text-xs text-gray-400">@{entry.user.githubUsername}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                {trend === "same" && <Minus className="h-4 w-4 text-gray-300" />}
                <Badge variant={entry.score >= 80 ? "success" : entry.score >= 50 ? "warning" : "danger"} size="md">
                  {entry.score}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

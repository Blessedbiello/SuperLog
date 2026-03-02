import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Github, Twitter, Flame, Trophy, Target, Calendar } from "lucide-react";
import Link from "next/link";

const LEVEL_NAMES: Record<number, string> = {
  1: "Newcomer",
  2: "Contributor",
  3: "Builder",
  4: "Core Builder",
  5: "Champion",
};

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { OR: [{ githubUsername: username }, { id: username }] },
    include: {
      projects: { select: { id: true, name: true, category: true, _count: { select: { githubActivities: true } } }, take: 6 },
      badges: { orderBy: { earnedAt: "desc" }, take: 12 },
      streaks: true,
      weeklyReports: { orderBy: { weekStart: "desc" }, take: 12, select: { score: true, weekStart: true } },
      _count: { select: { githubActivities: true, tweets: true, blogPosts: true } },
    },
  });

  if (!user) notFound();

  const activityStreak = user.streaks.find((s) => s.type === "ACTIVITY");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-900 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Avatar src={user.image} name={user.name} size="lg" className="mx-auto h-24 w-24 text-2xl ring-4 ring-white/20" />
          <h1 className="mt-4 text-3xl font-bold text-white">{user.name}</h1>
          {user.githubUsername && (
            <p className="mt-1 text-emerald-300">@{user.githubUsername}</p>
          )}
          {user.bio && <p className="mt-3 text-sm text-slate-300 max-w-md mx-auto">{user.bio}</p>}
          <div className="mt-4 flex items-center justify-center gap-3">
            <Badge variant="success" size="md">
              Lv.{user.level} {LEVEL_NAMES[user.level] || ""}
            </Badge>
            <Badge variant="default" size="md">{user.xp} XP</Badge>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            {user.githubUsername && (
              <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
            )}
            {user.twitterHandle && (
              <a href={`https://twitter.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Activities", value: user._count.githubActivities, icon: Github },
            { label: "Tweets", value: user._count.tweets, icon: Twitter },
            { label: "Blog Posts", value: user._count.blogPosts, icon: Target },
            { label: "Streak", value: `${activityStreak?.currentLength || 0}d`, icon: Flame },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <stat.icon className="mx-auto h-5 w-5 text-gray-400" />
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Score Trend */}
        {user.weeklyReports.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Weekly Scores</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-24">
                {user.weeklyReports.reverse().map((r, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-emerald-500 min-h-[2px]"
                      style={{ height: `${Math.max(r.score, 2)}%` }}
                    />
                    <span className="text-[8px] text-gray-400">{r.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {user.projects.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {user.projects.map((p) => (
                  <div key={p.id} className="rounded-lg border p-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="default">{p.category.toLowerCase().replace("_", " ")}</Badge>
                      <span className="text-xs text-gray-400">{p._count.githubActivities} activities</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badges */}
        {user.badges.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {user.badges.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-800">{b.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-gray-400">Powered by SuperLog</p>
      </div>
    </div>
  );
}

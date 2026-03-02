import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RewardForm } from "@/components/admin/reward-form";
import { Leaderboard } from "@/components/admin/leaderboard";
import { startOfWeek, endOfWeek } from "date-fns";

export default async function AdminRewardsPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [recentRewards, topContributors, members] = await Promise.all([
    prisma.reward.findMany({
      include: {
        user: { select: { name: true, image: true } },
        awardedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.weeklyReport.findMany({
      where: { weekStart: { gte: weekStart } },
      include: { user: { select: { name: true, image: true, githubUsername: true } } },
      orderBy: { score: "desc" },
      take: 10,
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const leaderboardEntries = topContributors.map((r, i) => ({
    rank: i + 1,
    user: r.user,
    score: r.score,
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
        <p className="text-sm text-gray-500">Distribute rewards to top contributors</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <RewardForm members={members} />

          <Card>
            <CardHeader><CardTitle>Recent Rewards</CardTitle></CardHeader>
            <CardContent>
              {recentRewards.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No rewards distributed yet</p>
              ) : (
                <div className="space-y-3">
                  {recentRewards.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.user.name}</p>
                        <p className="text-xs text-gray-500">{r.description}</p>
                      </div>
                      <Badge variant="success">{r.amount} {r.currency}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Leaderboard entries={leaderboardEntries} />
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { startOfWeek, subWeeks, format } from "date-fns";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const ws = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
    return ws;
  });

  const [weeklyScores, activityCounts, memberGrowth] = await Promise.all([
    Promise.all(
      weeks.map(async (ws) => {
        const avg = await prisma.weeklyReport.aggregate({
          where: { weekStart: ws },
          _avg: { score: true },
          _count: true,
        });
        return {
          week: format(ws, "MMM d"),
          avgScore: Math.round(avg._avg.score || 0),
          reports: avg._count,
        };
      })
    ),
    prisma.gitHubActivity.groupBy({
      by: ["type"],
      _count: true,
    }),
    Promise.all(
      weeks.map(async (ws) => {
        const count = await prisma.user.count({ where: { createdAt: { lte: ws } } });
        return { week: format(ws, "MMM d"), members: count };
      })
    ),
  ]);

  const typeDistribution = activityCounts.map((a) => ({
    name: a.type,
    value: a._count,
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Team Analytics</h2>
        <p className="text-sm text-gray-500">Community activity trends and insights</p>
      </div>
      <AnalyticsCharts
        weeklyScores={weeklyScores}
        typeDistribution={typeDistribution}
        memberGrowth={memberGrowth}
      />
    </div>
  );
}

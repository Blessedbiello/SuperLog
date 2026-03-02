import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Gift, TrendingUp, AlertTriangle } from "lucide-react";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const prevWeekStart = subWeeks(weekStart, 1);

  const [
    totalMembers,
    activeThisWeek,
    pendingVerifications,
    rewardsThisWeek,
    avgScore,
    newMembers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.gitHubActivity.groupBy({
      by: ["userId"],
      where: { occurredAt: { gte: weekStart, lte: weekEnd } },
    }).then((r) => r.length),
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.reward.count({ where: { weekStart: { gte: weekStart } } }),
    prisma.weeklyReport.aggregate({
      where: { weekStart: { gte: weekStart } },
      _avg: { score: true },
    }).then((r) => Math.round(r._avg.score || 0)),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
  ]);

  const stats = [
    { label: "Total Members", value: totalMembers, icon: Users, href: "/admin/members", color: "text-blue-600 bg-blue-50" },
    { label: "Active This Week", value: activeThisWeek, icon: TrendingUp, href: "/admin/analytics", color: "text-emerald-600 bg-emerald-50" },
    { label: "Pending Verifications", value: pendingVerifications, icon: CheckCircle, href: "/admin/verification", color: "text-amber-600 bg-amber-50" },
    { label: "Avg. Weekly Score", value: avgScore, icon: TrendingUp, href: "/admin/analytics", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">Community health overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                    <div className={`rounded-lg p-2 ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Review verifications", href: "/admin/verification", count: pendingVerifications },
              { label: "Manage members", href: "/admin/members", count: totalMembers },
              { label: "Distribute rewards", href: "/admin/rewards" },
              { label: "View analytics", href: "/admin/analytics" },
              { label: "Manage events", href: "/admin/events" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                {action.count !== undefined && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {action.count}
                  </span>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader><CardTitle>Alerts</CardTitle></CardHeader>
          <CardContent>
            {newMembers > 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-blue-700">{newMembers} new member(s) this week</span>
              </div>
            )}
            {pendingVerifications > 5 && (
              <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-sm text-amber-700">{pendingVerifications} verifications pending review</span>
              </div>
            )}
            {pendingVerifications === 0 && newMembers === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No alerts</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

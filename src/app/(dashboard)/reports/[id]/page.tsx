import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportDetail } from "@/components/reports/report-detail";
import { PlannedVsActual } from "@/components/reports/planned-vs-actual";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const report = await prisma.weeklyReport.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!report) notFound();

  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
      type: "WEEKLY",
      targetDate: { gte: report.weekStart, lte: report.weekEnd },
    },
  });

  const summary = (report.summary || {}) as Record<string, unknown>;
  const scoreBreakdown = (summary.score || {}) as Record<string, { count: number; points: number; cap: number }>;
  const goalComparisons = goals.map((g) => ({
    title: g.title,
    planned: "PLANNED",
    actual: g.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Report</h2>
          <p className="text-sm text-gray-500">
            {format(report.weekStart, "MMM d")} - {format(report.weekEnd, "MMM d, yyyy")}
          </p>
        </div>
      </div>

      <ReportDetail
        weekStart={report.weekStart.toISOString().split("T")[0]}
        weekEnd={report.weekEnd.toISOString().split("T")[0]}
        score={report.score}
        highlights={report.highlights}
        planningAccuracy={report.planningAccuracy}
        breakdown={scoreBreakdown}
        goals={(summary.goals as { titles: { title: string; status: string }[] })?.titles || []}
      />

      <PlannedVsActual goals={goalComparisons} accuracy={report.planningAccuracy} />
    </div>
  );
}

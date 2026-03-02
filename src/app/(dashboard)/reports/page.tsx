import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportCard } from "@/components/reports/report-card";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus } from "lucide-react";
import { GenerateReportButton } from "./generate-button";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reports = await prisma.weeklyReport.findMany({
    where: { userId: session.user.id },
    orderBy: { weekStart: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Reports</h2>
          <p className="text-sm text-gray-500">Track your proof-of-work over time</p>
        </div>
        <GenerateReportButton />
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No reports yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate your first weekly report to see your score and progress.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              id={report.id}
              weekStart={report.weekStart}
              weekEnd={report.weekEnd}
              score={report.score}
              highlights={report.highlights}
              planningAccuracy={report.planningAccuracy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

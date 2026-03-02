import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OKRTree } from "@/components/goals/okr-tree";

export default async function MonthlyGoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const objectives = await prisma.monthlyObjective.findMany({
    where: { userId: session.user.id, month: currentMonth, year: currentYear },
    include: {
      keyResults: {
        include: {
          goals: {
            select: { id: true, title: true, status: true, type: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/goals" className="rounded-lg p-2 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monthly OKRs</h2>
            <p className="text-sm text-gray-500">
              {monthName} {currentYear} Objectives & Key Results
            </p>
          </div>
        </div>
      </div>

      {objectives.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No objectives set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set 2-3 OKR-style objectives for {monthName} to guide your weekly goals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <OKRTree objectives={objectives} />
      )}
    </div>
  );
}

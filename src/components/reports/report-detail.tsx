"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ScoreItem {
  count: number;
  points: number;
  cap: number;
}

interface ReportDetailProps {
  weekStart: string;
  weekEnd: string;
  score: number;
  highlights: string | null;
  planningAccuracy: number | null;
  breakdown: Record<string, ScoreItem | { completed: boolean; points: number; cap: number }>;
  goals: { title: string; status: string }[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#f97316"];

export function ReportDetail({
  weekStart,
  weekEnd,
  score,
  highlights,
  planningAccuracy,
  breakdown,
  goals,
}: ReportDetailProps) {
  const pieData = Object.entries(breakdown)
    .filter(([, val]) => typeof val === "object" && "points" in val && val.points > 0)
    .map(([key, val]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: (val as { points: number }).points,
    }));

  const handleExport = (format: "pdf" | "csv") => {
    window.open(`/api/reports/export?format=${format}&weekStart=${weekStart}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Weekly Score</p>
              <p className="text-5xl font-bold text-emerald-600">{score}</p>
              <p className="text-sm text-gray-400 mt-1">/100 points</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
          {highlights && <p className="mt-4 text-sm text-gray-600">{highlights}</p>}
          {planningAccuracy !== null && (
            <div className="mt-3">
              <Badge variant={planningAccuracy >= 80 ? "success" : planningAccuracy >= 50 ? "warning" : "danger"}>
                {planningAccuracy}% planning accuracy
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-gray-400 py-12">No score data</p>
            )}
            <div className="mt-4 space-y-2">
              {Object.entries(breakdown).map(([key, val]) => {
                const v = val as ScoreItem;
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key}</span>
                    <span className="font-medium text-gray-900">
                      {v.points}/{v.cap} pts
                      {"count" in v && <span className="text-gray-400 ml-1">({v.count})</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Goals Review */}
        <Card>
          <CardHeader>
            <CardTitle>Goals Review</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-12">No goals set this week</p>
            ) : (
              <div className="space-y-2">
                {goals.map((goal, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm text-gray-800">{goal.title}</span>
                    <Badge
                      variant={
                        goal.status === "COMPLETED" ? "success" : goal.status === "MISSED" ? "danger" : "warning"
                      }
                    >
                      {goal.status.toLowerCase().replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

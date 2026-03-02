import Link from "next/link";
import { BarChart3, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ReportCardProps {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  score: number;
  highlights: string | null;
  planningAccuracy: number | null;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 50) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function getScoreVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export function ReportCard({ id, weekStart, weekEnd, score, highlights, planningAccuracy }: ReportCardProps) {
  return (
    <Link href={`/reports/${id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${getScoreColor(score)}`}>
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                  </p>
                </div>
                {highlights && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-1">{highlights}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {planningAccuracy !== null && (
                <Badge variant="default">{planningAccuracy}% accuracy</Badge>
              )}
              <Badge variant={getScoreVariant(score)} size="md">
                {score}/100
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

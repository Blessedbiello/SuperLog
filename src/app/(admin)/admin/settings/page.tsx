import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Webhook, Clock } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-sm text-gray-500">Configure system-wide preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Webhook className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">GitHub Webhooks</p>
                <p className="text-xs text-gray-500">Receive real-time updates from GitHub</p>
              </div>
            </div>
            <Badge variant={process.env.GITHUB_WEBHOOK_SECRET ? "success" : "warning"}>
              {process.env.GITHUB_WEBHOOK_SECRET ? "Configured" : "Not set"}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cron Jobs</p>
                <p className="text-xs text-gray-500">Automated weekly reports and GitHub sync</p>
              </div>
            </div>
            <Badge variant={process.env.CRON_SECRET ? "success" : "warning"}>
              {process.env.CRON_SECRET ? "Configured" : "Not set"}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">PostgreSQL via Prisma ORM</p>
              </div>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Scoring Configuration</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2 font-medium text-gray-500 border-b pb-2">
              <span>Activity</span>
              <span>Points</span>
              <span>Weekly Cap</span>
            </div>
            {[
              { activity: "Commit", points: 2, cap: 30 },
              { activity: "Pull Request", points: 5, cap: 25 },
              { activity: "Issue", points: 3, cap: 15 },
              { activity: "Code Review", points: 4, cap: 20 },
              { activity: "Release", points: 10, cap: 10 },
              { activity: "Tweet", points: 3, cap: 15 },
              { activity: "Blog Post", points: 8, cap: 16 },
              { activity: "Planning", points: 10, cap: 10 },
              { activity: "Retrospective", points: 10, cap: 10 },
            ].map((r) => (
              <div key={r.activity} className="grid grid-cols-3 gap-2 text-gray-700">
                <span>{r.activity}</span>
                <span>{r.points}</span>
                <span>{r.cap}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

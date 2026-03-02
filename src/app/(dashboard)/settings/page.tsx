import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Bell, Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, githubAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubUsername: true, twitterHandle: true },
    }),
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { providerAccountId: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage integrations and preferences</p>
      </div>

      {/* Integrations */}
      <Card>
        <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Github className="h-6 w-6 text-gray-700" />
              <div>
                <p className="text-sm font-medium text-gray-900">GitHub</p>
                <p className="text-xs text-gray-500">
                  {githubAccount ? `Connected as @${user?.githubUsername || "unknown"}` : "Not connected"}
                </p>
              </div>
            </div>
            <Badge variant={githubAccount ? "success" : "default"}>
              {githubAccount ? "Connected" : "Not connected"}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Twitter className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Twitter / X</p>
                <p className="text-xs text-gray-500">
                  {user?.twitterHandle ? `@${user.twitterHandle}` : "Add handle in Profile settings"}
                </p>
              </div>
            </div>
            <Badge variant={user?.twitterHandle ? "success" : "default"}>
              {user?.twitterHandle ? "Configured" : "Not set"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["Report ready", "Verification update", "Reward received", "Streak at risk", "Shoutout received"].map((n) => (
              <div key={n} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{n}</span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-700">Public Profile</p>
                <p className="text-xs text-gray-500">Allow anyone to view your profile at /p/username</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitHubCard } from "@/components/activities/github-card";

const goalStatusVariant: Record<string, "success" | "info" | "default" | "danger" | "warning"> = {
  COMPLETED: "success",
  IN_PROGRESS: "info",
  PLANNED: "default",
  MISSED: "danger",
  CARRIED_OVER: "warning",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      goals: { orderBy: { createdAt: "desc" }, take: 20 },
      githubActivities: { orderBy: { occurredAt: "desc" }, take: 10 },
    },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
          <Badge variant="default">{project.category.replace("_", " ")}</Badge>
        </div>
        {project.description && (
          <p className="mt-1 text-sm text-gray-600">{project.description}</p>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800"
          >
            <ExternalLink className="h-3 w-3" />
            {project.repoUrl}
          </a>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
        {project.goals.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center text-sm text-gray-500">
              No goals set for this project yet.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 space-y-2">
            {project.goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                    {goal.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{goal.description}</p>
                    )}
                  </div>
                  <Badge variant={goalStatusVariant[goal.status] ?? "default"}>
                    {goal.status.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">GitHub Activities</h3>
        {project.githubActivities.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="py-8 text-center text-sm text-gray-500">
              No GitHub activities linked to this project.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 space-y-3">
            {project.githubActivities.map((activity) => (
              <GitHubCard
                key={activity.id}
                activity={{
                  id: activity.id,
                  type: activity.type as "COMMIT" | "PR" | "ISSUE" | "REVIEW" | "RELEASE",
                  title: activity.title,
                  url: activity.url,
                  repo: activity.repo,
                  occurredAt: activity.occurredAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

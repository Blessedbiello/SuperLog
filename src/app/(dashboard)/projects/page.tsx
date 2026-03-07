import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { goals: true, githubActivities: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
          <FolderKanban className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500">
            {projects.length} project{projects.length === 1 ? "" : "s"} tracked
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-500">
            No projects yet. Create one from the onboarding flow or API.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{project.category.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {project.description ? (
                  <p className="text-sm text-gray-600">{project.description}</p>
                ) : (
                  <p className="text-sm text-gray-400">No description</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{project._count.goals} goals</span>
                  <span>{project._count.githubActivities} github activities</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const LEVEL_NAMES: Record<number, string> = {
  1: "Newcomer",
  2: "Contributor",
  3: "Builder",
  4: "Core Builder",
  5: "Champion",
};

export async function MemberDirectory() {
  const members = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      githubUsername: true,
      bio: true,
      level: true,
      role: true,
      _count: { select: { githubActivities: true, badges: true } },
    },
    orderBy: { xp: "desc" },
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Link key={member.id} href={`/p/${member.githubUsername || member.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar src={member.image} name={member.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                  {member.githubUsername && (
                    <p className="text-xs text-gray-500">@{member.githubUsername}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      Lv.{member.level} {LEVEL_NAMES[member.level] || ""}
                    </Badge>
                    {member.role === "ADMIN" && <Badge variant="info" size="sm">Admin</Badge>}
                  </div>
                </div>
              </div>
              {member.bio && (
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{member.bio}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>{member._count.githubActivities} activities</span>
                <span>{member._count.badges} badges</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationQueue } from "@/components/admin/verification-queue";

export default async function AdminVerificationPage() {
  const verifications = await prisma.verification.findMany({
    where: { status: "PENDING" },
    include: {
      githubActivity: { select: { title: true, type: true, url: true, repo: true, user: { select: { name: true } } } },
      tweet: { select: { url: true, content: true, user: { select: { name: true } } } },
      blogPost: { select: { title: true, url: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const items = verifications.map((v) => {
    const activity = v.githubActivity || v.tweet || v.blogPost;
    const type = v.githubActivityId ? "github" : v.tweetId ? "tweet" : "blog";
    return {
      id: v.id,
      type,
      title: (activity && "title" in activity ? activity.title : (activity && "content" in activity ? activity.content?.slice(0, 80) : "")) || "Untitled",
      url: activity && "url" in activity ? activity.url : null,
      userName: activity && "user" in activity ? (activity.user as { name: string | null }).name : null,
      createdAt: v.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Verification Queue</h2>
        <p className="text-sm text-gray-500">{items.length} items pending review</p>
      </div>
      <VerificationQueue items={items} />
    </div>
  );
}

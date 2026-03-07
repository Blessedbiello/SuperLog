"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { GitHubCard } from "@/components/activities/github-card";
import { TweetCard } from "@/components/activities/tweet-card";
import { BlogCard } from "@/components/activities/blog-card";
import { QuickLogModal } from "@/components/activities/quick-log-modal";
import { useActivities } from "@/hooks/use-activities";
import { useTweets } from "@/hooks/use-tweets";
import { useBlogs } from "@/hooks/use-blogs";

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const { activities, loading: githubLoading, refresh: refreshGithub } = useActivities({ type: "github" });
  const { tweets, loading: tweetsLoading, refresh: refreshTweets } = useTweets();
  const { blogs, loading: blogsLoading, refresh: refreshBlogs } = useBlogs();

  useEffect(() => {
    if (searchParams.get("quicklog") === "1") {
      setModalOpen(true);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    refreshTweets();
    refreshBlogs();
    refreshGithub();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Activity className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
            <p className="text-sm text-gray-500">Track your development activity</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Quick Log
        </button>
      </div>

      <Tabs defaultValue="github">
        <TabsList>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="tweets">Tweets</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          {githubLoading ? (
            <LoadingCards />
          ) : activities.length === 0 ? (
            <EmptyState message="No GitHub activities yet. Connect your GitHub account to start tracking." />
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <GitHubCard
                  key={a.id}
                  activity={{
                    id: a.id,
                    type: (a as { meta?: { activityType?: string } }).meta?.activityType as "COMMIT" | "PR" | "ISSUE" | "REVIEW" | "RELEASE" || "COMMIT",
                    title: a.title,
                    url: a.url ?? null,
                    repo: (a as { meta?: { repo?: string } }).meta?.repo ?? "",
                    occurredAt: a.date,
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tweets">
          {tweetsLoading ? (
            <LoadingCards />
          ) : tweets.length === 0 ? (
            <EmptyState message="No tweets logged yet. Use Quick Log to add your first tweet." />
          ) : (
            <div className="space-y-3">
              {tweets.map((t) => (
                <TweetCard key={t.id} tweet={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="blogs">
          {blogsLoading ? (
            <LoadingCards />
          ) : blogs.length === 0 ? (
            <EmptyState message="No blog posts logged yet. Use Quick Log to add your first post." />
          ) : (
            <div className="space-y-3">
              {blogs.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <QuickLogModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-gray-500">
        {message}
      </CardContent>
    </Card>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  fetchPlatformStats,
  fetchHeatmapData,
  fetchRecentActivity,
} from "@/lib/landing/data";
import { Hero } from "@/components/landing/hero";
import { ActivityTicker } from "@/components/landing/activity-ticker";
import { NigeriaHeatmap } from "@/components/landing/nigeria-heatmap";
import { StatsCounter } from "@/components/landing/stats-counter";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CtaFooter } from "@/components/landing/cta-footer";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const [stats, heatmapData, recentActivity] = await Promise.all([
    fetchPlatformStats(),
    fetchHeatmapData(),
    fetchRecentActivity(),
  ]);

  return (
    <main className="bg-slate-950">
      <Hero />
      <ActivityTicker activities={recentActivity} />
      <StatsCounter stats={stats} />
      <NigeriaHeatmap data={heatmapData} />
      <FeaturesGrid />
      <HowItWorks />
      <CtaFooter />
    </main>
  );
}

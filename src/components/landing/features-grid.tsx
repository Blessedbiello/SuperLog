"use client";

import {
  GitCommit,
  FileText,
  BarChart3,
  Target,
  User,
  Trophy,
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const features = [
  {
    icon: GitCommit,
    title: "GitHub Sync",
    description: "Auto-track commits, PRs, issues across all your repos.",
  },
  {
    icon: FileText,
    title: "Content Tracking",
    description: "Log blogs, tweets, and threads in one place.",
  },
  {
    icon: BarChart3,
    title: "Weekly Reports",
    description: "Get scored on consistency and output every week.",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set weekly and monthly goals to stay focused.",
  },
  {
    icon: User,
    title: "Public Profile",
    description: "Showcase your portfolio to the community.",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Earn XP, badges, and climb the leaderboard.",
  },
];

export function FeaturesGrid() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="bg-slate-950 py-20" ref={ref}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Everything You Need to Prove Your Work
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 transition-all duration-500 ${
                isInView
                  ? "animate-fade-in-up opacity-100"
                  : "opacity-0 translate-y-5"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-emerald-950/50 p-3">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

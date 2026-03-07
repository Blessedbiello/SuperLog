"use client";

import { useEffect, useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface StatsCounterProps {
  stats: {
    totalUsers: number;
    totalContributions: number;
    totalProjects: number;
    totalBlogs: number;
  };
}

function AnimatedNumber({ target, isInView }: { target: number; isInView: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    if (target === 0) return;

    const duration = 1500;
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [isInView, target]);

  return <span>{value.toLocaleString()}</span>;
}

const statItems = [
  { key: "totalUsers" as const, label: "Developers" },
  { key: "totalContributions" as const, label: "Contributions" },
  { key: "totalProjects" as const, label: "Projects" },
  { key: "totalBlogs" as const, label: "Blog Posts" },
];

export function StatsCounter({ stats }: StatsCounterProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section className="border-y border-slate-800 bg-slate-900/50 py-16" ref={ref}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {statItems.map((item) => (
            <div key={item.key} className="text-center">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                <AnimatedNumber target={stats[item.key]} isInView={isInView} />
              </p>
              <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-emerald-500" />
              <p className="mt-2 text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

interface HeatmapData {
  [stateId: string]: { users: number; commits: number; content: number };
}

type ActivityFilter = "all" | "commits" | "content";

function getCount(
  d: { commits: number; content: number },
  filter: ActivityFilter
): number {
  if (filter === "commits") return d.commits;
  if (filter === "content") return d.content;
  return d.commits + d.content;
}

function getColor(count: number): string {
  if (count === 0) return "#1e293b";
  if (count < 5) return "#064e3b";
  if (count < 20) return "#047857";
  if (count < 50) return "#10b981";
  return "#34d399";
}

const filterLabels: { key: ActivityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "commits", label: "Commits" },
  { key: "content", label: "Content" },
];

const LeafletMap = dynamic(() => import("./nigeria-leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl bg-slate-900">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
});

export function NigeriaHeatmap({ data }: { data: HeatmapData }) {
  const [filter, setFilter] = useState<ActivityFilter>("all");

  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Activity Across Nigeria
          </h2>
          <p className="mt-3 text-slate-400">
            Developer contributions by state
          </p>
        </div>

        {/* Activity Filter Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-slate-800 p-1">
            {filterLabels.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <LeafletMap data={data} filter={filter} />

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              {["#1e293b", "#064e3b", "#047857", "#10b981", "#34d399"].map(
                (color) => (
                  <div
                    key={color}
                    className="h-3 w-6 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}

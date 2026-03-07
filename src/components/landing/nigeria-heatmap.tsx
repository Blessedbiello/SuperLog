"use client";

import { useState } from "react";
import { NIGERIA_SVG } from "./nigeria-svg-paths";

interface HeatmapData {
  [stateId: string]: { users: number; activities: number };
}

function getColor(activities: number): string {
  if (activities === 0) return "#1e293b"; // slate-800
  if (activities < 5) return "#064e3b"; // emerald-900
  if (activities < 20) return "#047857"; // emerald-700
  if (activities < 50) return "#10b981"; // emerald-500
  return "#34d399"; // emerald-400
}

function getGlow(activities: number): string {
  if (activities >= 50) return "drop-shadow(0 0 8px #10b981)";
  return "none";
}

export function NigeriaHeatmap({ data }: { data: HeatmapData }) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    users: number;
    activities: number;
    x: number;
    y: number;
  } | null>(null);

  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Activity Across Nigeria
          </h2>
          <p className="mt-3 text-slate-400">
            Developer contributions by state
          </p>
        </div>

        <div className="relative mx-auto max-w-2xl">
          <svg
            viewBox="0 0 800 900"
            className="w-full h-auto"
            onMouseLeave={() => setTooltip(null)}
          >
            {Object.entries(NIGERIA_SVG).map(([id, { name, path }]) => {
              const stateData = data[id] || { users: 0, activities: 0 };
              return (
                <path
                  key={id}
                  d={path}
                  fill={getColor(stateData.activities)}
                  stroke="#334155"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-200 hover:brightness-150"
                  style={{ filter: getGlow(stateData.activities) }}
                  onMouseEnter={(e) => {
                    const svg = e.currentTarget.closest("svg");
                    if (!svg) return;
                    const rect = svg.getBoundingClientRect();
                    const clientX = e.clientX - rect.left;
                    const clientY = e.clientY - rect.top;
                    setTooltip({
                      name,
                      users: stateData.users,
                      activities: stateData.activities,
                      x: clientX,
                      y: clientY,
                    });
                  }}
                  onMouseMove={(e) => {
                    const svg = e.currentTarget.closest("svg");
                    if (!svg) return;
                    const rect = svg.getBoundingClientRect();
                    setTooltip((prev) =>
                      prev
                        ? {
                            ...prev,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          }
                        : null
                    );
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-xl"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y - 10,
              }}
            >
              <p className="font-semibold text-white">{tooltip.name}</p>
              <p className="text-slate-400">
                {tooltip.users} developer{tooltip.users !== 1 ? "s" : ""}
              </p>
              <p className="text-emerald-400">
                {tooltip.activities} contribution
                {tooltip.activities !== 1 ? "s" : ""}
              </p>
            </div>
          )}

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

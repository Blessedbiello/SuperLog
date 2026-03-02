"use client";

import { CheckCircle, Circle } from "lucide-react";
import { clsx } from "clsx";
import type { OnboardingSteps } from "@/types";

interface OnboardingChecklistProps {
  steps: OnboardingSteps;
}

const stepLabels: { key: keyof OnboardingSteps; label: string; description: string }[] = [
  { key: "profileSetup", label: "Set up your profile", description: "Add your bio and social links" },
  { key: "githubConnected", label: "Connect GitHub", description: "Link your GitHub account for auto-sync" },
  { key: "twitterConnected", label: "Add Twitter handle", description: "Share your build-in-public tweets" },
  { key: "firstProject", label: "Create first project", description: "Add a project you're working on" },
  { key: "firstPlan", label: "Set your first goal", description: "Plan what you'll accomplish this week" },
  { key: "firstLog", label: "Log your first activity", description: "Record what you built or wrote today" },
];

export function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
  const completedCount = Object.values(steps).filter(Boolean).length;
  const totalSteps = stepLabels.length;
  const allComplete = completedCount === totalSteps;

  if (allComplete) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Get Started</h3>
        <p className="text-sm text-gray-500">
          Complete these steps to set up your SuperLog ({completedCount}/{totalSteps})
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(completedCount / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {stepLabels.map((step) => {
          const done = steps[step.key];
          return (
            <div key={step.key} className="flex items-start gap-3">
              {done ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
              )}
              <div>
                <p className={clsx("text-sm font-medium", done ? "text-gray-400 line-through" : "text-gray-900")}>
                  {step.label}
                </p>
                {!done && <p className="text-xs text-gray-500">{step.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

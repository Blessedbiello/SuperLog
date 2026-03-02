"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface ReactionButtonsProps {
  activityType: string;
  activityId: string;
  initialReactions?: Record<string, number>;
  userReaction?: string | null;
}

const REACTIONS = [
  { type: "fire", emoji: "\u{1F525}", label: "Fire" },
  { type: "gem", emoji: "\u{1F48E}", label: "Gem" },
  { type: "rocket", emoji: "\u{1F680}", label: "Rocket" },
  { type: "100", emoji: "\u{1F4AF}", label: "100" },
];

export function ReactionButtons({
  activityType,
  activityId,
  initialReactions = {},
  userReaction = null,
}: ReactionButtonsProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [active, setActive] = useState(userReaction);

  const handleReact = async (type: string) => {
    const prev = active;
    const prevReactions = { ...reactions };

    // Optimistic update
    if (active === type) {
      setActive(null);
      setReactions((r) => ({ ...r, [type]: Math.max(0, (r[type] || 0) - 1) }));
    } else {
      if (prev) {
        setReactions((r) => ({ ...r, [prev]: Math.max(0, (r[prev] || 0) - 1) }));
      }
      setActive(type);
      setReactions((r) => ({ ...r, [type]: (r[type] || 0) + 1 }));
    }

    try {
      await fetch("/api/social/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, activityType, activityId }),
      });
    } catch {
      setActive(prev);
      setReactions(prevReactions);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map((r) => {
        const count = reactions[r.type] || 0;
        const isActive = active === r.type;
        return (
          <button
            key={r.type}
            onClick={() => handleReact(r.type)}
            title={r.label}
            className={clsx(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            )}
          >
            <span>{r.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

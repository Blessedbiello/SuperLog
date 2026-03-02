"use client";

import { useState } from "react";
import { Target, Check } from "lucide-react";

interface DailyFocusProps {
  currentFocus?: string | null;
  onSave: (focus: string) => Promise<void>;
}

export function DailyFocus({ currentFocus, onSave }: DailyFocusProps) {
  const [focus, setFocus] = useState(currentFocus || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!currentFocus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focus.trim()) return;
    setSaving(true);
    try {
      await onSave(focus.trim());
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-emerald-500" />
        <h3 className="text-sm font-semibold text-gray-900">Today&apos;s Focus</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={focus}
          onChange={(e) => {
            setFocus(e.target.value);
            setSaved(false);
          }}
          placeholder="What's your primary output today?"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
        />
        <button
          type="submit"
          disabled={saving || !focus.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
        >
          {saved ? <Check className="h-4 w-4" /> : saving ? "..." : "Set"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, MinusCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CalendarEventStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoalOption {
  id: string;
  title: string;
}

interface FocusBlockProps {
  goals?: GoalOption[];
  onCreated?: (event: unknown) => void;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: CalendarEventStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: "SCHEDULED", label: "Scheduled",  icon: Clock },
  { value: "COMPLETED", label: "Completed",  icon: CheckCircle2 },
  { value: "PARTIAL",   label: "Partial",    icon: MinusCircle },
  { value: "MISSED",    label: "Missed",     icon: XCircle },
];

const STATUS_COLORS: Record<CalendarEventStatus, string> = {
  SCHEDULED: "text-slate-600 bg-slate-100",
  COMPLETED: "text-emerald-700 bg-emerald-50",
  PARTIAL:   "text-amber-700 bg-amber-50",
  MISSED:    "text-red-700 bg-red-50",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function nowRounded(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return toLocalDatetimeString(d);
}

function oneHourLater(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(d.getHours() + 1);
  return toLocalDatetimeString(d);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FocusBlock({ goals = [], onCreated }: FocusBlockProps) {
  const [title, setTitle]       = useState("Focus Block");
  const [startTime, setStart]   = useState(nowRounded);
  const [endTime, setEnd]       = useState(oneHourLater);
  const [status, setStatus]     = useState<CalendarEventStatus>("SCHEDULED");
  const [goalId, setGoalId]     = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  async function handleCreate() {
    setError(null);

    if (!title.trim())  { setError("Title is required"); return; }
    if (!startTime)     { setError("Start time is required"); return; }
    if (!endTime)       { setError("End time is required"); return; }
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        type: "FOCUS_BLOCK",
        startTime: new Date(startTime).toISOString(),
        endTime:   new Date(endTime).toISOString(),
        status,
        goalId: goalId || undefined,
      };

      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not create focus block");
        return;
      }

      onCreated?.(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      // Reset times for next creation
      setTitle("Focus Block");
      setStart(nowRounded());
      setEnd(oneHourLater());
      setGoalId("");
      setStatus("SCHEDULED");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const activeStatus = STATUS_OPTIONS.find((s) => s.value === status)!;
  const StatusIcon = activeStatus.icon;

  const goalOptions = [
    { value: "", label: "No goal" },
    ...goals.map((g) => ({ value: g.id, label: g.title })),
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Clock className="h-4 w-4 text-emerald-700" />
          </div>
          <CardTitle className="text-base">Quick Focus Block</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <Input
          label="Label"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you focusing on?"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStart(e.target.value)}
          />
          <Input
            label="End"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        {/* Status toggle row */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors
                  ${status === value
                    ? STATUS_COLORS[value]
                    : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                  }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {goals.length > 0 && (
          <Select
            label="Link to Goal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            options={goalOptions}
          />
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={handleCreate}
          loading={saving}
        >
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Block Created
            </>
          ) : (
            <>
              <StatusIcon className="h-4 w-4" />
              Create Focus Block
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

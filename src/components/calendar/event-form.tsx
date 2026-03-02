"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from "@/lib/calendar/utils";
import type { CalendarEventType, CalendarEventStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarEventData {
  id?: string;
  title: string;
  type: CalendarEventType;
  startTime: string;
  endTime: string;
  status: CalendarEventStatus;
  goalId?: string | null;
  projectId?: string | null;
}

interface GoalOption {
  id: string;
  title: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (event: CalendarEventData) => void;
  initialData?: Partial<CalendarEventData> | null;
  goals?: GoalOption[];
  projects?: ProjectOption[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string | Date | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  // format: YYYY-MM-DDTHH:mm  (datetime-local input format)
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const EVENT_STATUS_OPTIONS = Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ─── Component ────────────────────────────────────────────────────────────────

export function EventForm({
  open,
  onClose,
  onSaved,
  initialData,
  goals = [],
  projects = [],
}: EventFormProps) {
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle]       = useState("");
  const [type, setType]         = useState<CalendarEventType>("FOCUS_BLOCK");
  const [startTime, setStart]   = useState("");
  const [endTime, setEnd]       = useState("");
  const [status, setStatus]     = useState<CalendarEventStatus>("SCHEDULED");
  const [goalId, setGoalId]     = useState("");
  const [projectId, setProjId]  = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);

  // Populate fields when initialData changes or modal opens
  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setType(initialData?.type ?? "FOCUS_BLOCK");
      setStart(toDatetimeLocal(initialData?.startTime));
      setEnd(toDatetimeLocal(initialData?.endTime));
      setStatus(initialData?.status ?? "SCHEDULED");
      setGoalId(initialData?.goalId ?? "");
      setProjId(initialData?.projectId ?? "");
      setError(null);
    }
  }, [open, initialData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Title is required"); return; }
    if (!startTime)    { setError("Start time is required"); return; }
    if (!endTime)      { setError("End time is required"); return; }
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        startTime: new Date(startTime).toISOString(),
        endTime:   new Date(endTime).toISOString(),
        status,
        goalId:    goalId || undefined,
        projectId: projectId || undefined,
      };

      const url     = isEdit ? `/api/calendar/${initialData!.id}` : "/api/calendar";
      const method  = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong");
        return;
      }

      onSaved(json.data as CalendarEventData);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const goalOptions = [
    { value: "", label: "None" },
    ...goals.map((g) => ({ value: g.id, label: g.title })),
  ];

  const projectOptions = [
    { value: "", label: "None" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Event" : "New Event"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Deep work session"
          required
        />

        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as CalendarEventType)}
          options={EVENT_TYPE_OPTIONS}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <Input
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </div>

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as CalendarEventStatus)}
          options={EVENT_STATUS_OPTIONS}
        />

        {goals.length > 0 && (
          <Select
            label="Link to Goal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            options={goalOptions}
          />
        )}

        {projects.length > 0 && (
          <Select
            label="Link to Project"
            value={projectId}
            onChange={(e) => setProjId(e.target.value)}
            options={projectOptions}
          />
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {isEdit ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

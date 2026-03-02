"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { GoalType, GoalStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GoalData {
  id?: string;
  title: string;
  description?: string | null;
  type: GoalType;
  status: GoalStatus;
  targetDate?: string | null;
  projectId?: string | null;
  keyResultId?: string | null;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface KeyResultOption {
  id: string;
  title: string;
  objectiveTitle?: string;
}

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (goal: GoalData) => void;
  initialData?: Partial<GoalData> | null;
  projects?: ProjectOption[];
  keyResults?: KeyResultOption[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInputValue(iso: string | Date | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: "DAILY",   label: "Daily" },
  { value: "WEEKLY",  label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

const GOAL_STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "PLANNED",     label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED",   label: "Completed" },
  { value: "MISSED",      label: "Missed" },
  { value: "CARRIED_OVER", label: "Carried Over" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function GoalForm({
  open,
  onClose,
  onSaved,
  initialData,
  projects = [],
  keyResults = [],
}: GoalFormProps) {
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [type, setType]             = useState<GoalType>("WEEKLY");
  const [status, setStatus]         = useState<GoalStatus>("PLANNED");
  const [targetDate, setTargetDate] = useState("");
  const [projectId, setProjectId]   = useState("");
  const [keyResultId, setKrId]      = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setDesc(initialData?.description ?? "");
      setType(initialData?.type ?? "WEEKLY");
      setStatus(initialData?.status ?? "PLANNED");
      setTargetDate(toDateInputValue(initialData?.targetDate));
      setProjectId(initialData?.projectId ?? "");
      setKrId(initialData?.keyResultId ?? "");
      setError(null);
    }
  }, [open, initialData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Title is required"); return; }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title:       title.trim(),
        description: description.trim() || undefined,
        type,
        status,
        targetDate:  targetDate ? new Date(targetDate).toISOString() : undefined,
        projectId:   projectId || undefined,
        keyResultId: keyResultId || undefined,
      };

      const url    = isEdit ? `/api/goals/${initialData!.id}` : "/api/goals";
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Something went wrong");
        return;
      }

      onSaved(json.data as GoalData);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const projectOptions = [
    { value: "", label: "No project" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const krOptions = [
    { value: "", label: "No key result" },
    ...keyResults.map((kr) => ({
      value: kr.id,
      label: kr.objectiveTitle ? `${kr.objectiveTitle} → ${kr.title}` : kr.title,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Goal" : "New Goal"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ship the auth module"
          required
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Any notes, acceptance criteria…"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as GoalType)}
            options={GOAL_TYPE_OPTIONS}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as GoalStatus)}
            options={GOAL_STATUS_OPTIONS}
          />
        </div>

        <Input
          label="Target Date (optional)"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        {projects.length > 0 && (
          <Select
            label="Link to Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projectOptions}
          />
        )}

        {keyResults.length > 0 && (
          <Select
            label="Link to Key Result"
            value={keyResultId}
            onChange={(e) => setKrId(e.target.value)}
            options={krOptions}
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
            {isEdit ? "Save Changes" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

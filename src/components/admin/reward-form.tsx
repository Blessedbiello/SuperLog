"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RewardFormProps {
  members: { id: string; name: string | null }[];
}

export function RewardForm({ members }: RewardFormProps) {
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !description || !amount) return;
    setSaving(true);
    try {
      await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          description,
          amount: parseFloat(amount),
        }),
      });
      setUserId("");
      setDescription("");
      setAmount("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Distribute Reward</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Member"
            options={members.map((m) => ({ value: m.id, label: m.name || "Unknown" }))}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Select member..."
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Top contributor of the week"
            required
          />
          <Input
            label="Amount (SOL)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Button type="submit" variant="primary" loading={saving}>
            Distribute Reward
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

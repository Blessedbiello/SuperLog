"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { NIGERIA_STATES } from "@/lib/landing/nigeria-states";

export function LocationSelector({ currentState }: { currentState: string }) {
  const [state, setState] = useState(currentState);
  const [saving, setSaving] = useState(false);

  async function handleChange(value: string) {
    setState(value);
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: value }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-400" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-gray-500">
          Select your state to appear on the community activity map.
        </p>
        <Select
          value={state}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          placeholder="Select your state"
          options={NIGERIA_STATES.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
        />
      </CardContent>
    </Card>
  );
}
